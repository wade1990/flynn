//go:generate protoc -I/usr/local/include -I./protobuf -I${GOPATH}/src/github.com/grpc-ecosystem/grpc-gateway/third_party/googleapis --go_out=plugins=grpc:./protobuf ./protobuf/controller.proto
package main

import (
	"encoding/json"
	"errors"
	fmt "fmt"
	"net"
	"net/http"
	"os"
	"reflect"
	"sync"
	"syscall"
	"time"

	"github.com/flynn/flynn/controller-grpc/protobuf"
	"github.com/flynn/flynn/controller-grpc/utils"
	"github.com/flynn/flynn/controller/data"
	controllerschema "github.com/flynn/flynn/controller/schema"
	ct "github.com/flynn/flynn/controller/types"
	"github.com/flynn/flynn/pkg/cors"
	"github.com/flynn/flynn/pkg/ctxhelper"
	"github.com/flynn/flynn/pkg/httphelper"
	"github.com/flynn/flynn/pkg/postgres"
	"github.com/flynn/flynn/pkg/shutdown"
	routerc "github.com/flynn/flynn/router/client"
	que "github.com/flynn/que-go"
	"github.com/improbable-eng/grpc-web/go/grpcweb"
	log "github.com/inconshreveable/log15"
	"github.com/soheilhy/cmux"
	"golang.org/x/net/context"
	"google.golang.org/grpc"
	"google.golang.org/grpc/reflection"
	"google.golang.org/grpc/stats"
)

func mustEnv(key string) string {
	if val, ok := os.LookupEnv(key); ok {
		return val
	}
	panic(fmt.Errorf("%s is required", key))
}

var logger = log.New("component", "controller-grpc")

func main() {
	// Increase resources limitations
	// See https://github.com/eranyanay/1m-go-websockets/blob/master/2_ws_ulimit/server.go
	var rLimit syscall.Rlimit
	if err := syscall.Getrlimit(syscall.RLIMIT_NOFILE, &rLimit); err != nil {
		panic(err)
	}
	rLimit.Cur = rLimit.Max
	if err := syscall.Setrlimit(syscall.RLIMIT_NOFILE, &rLimit); err != nil {
		panic(err)
	}

	logger.Debug("opening database connection...")

	// Open connection to main controller database
	db := postgres.Wait(nil, controllerschema.PrepareStatements)
	shutdown.BeforeExit(func() { db.Close() })
	q := que.NewClient(db.ConnPool)

	logger.Debug("initializing server...")

	s := NewServer(configureRepos(&Config{
		DB: db,
		q:  q,
	}))

	port := os.Getenv("PORT")
	if port == "" {
		port = "3000"
	}
	addr := ":" + port
	logger.Debug(fmt.Sprintf("attempting to listen on %q...", addr))
	l, err := net.Listen("tcp", addr)
	if err != nil {
		logger.Debug(fmt.Sprintf("error opening listener on %q...: %v", addr, err))
		shutdown.Fatalf("failed to create listener: %v", err)
	}
	logger.Debug("listener aquired")
	shutdown.BeforeExit(func() { l.Close() })
	runServer(s, l)
	logger.Debug("servers stopped")
}

func runServer(s *grpc.Server, l net.Listener) {
	logger.Debug("initializing grpc-web server...")
	grpcWebServer := grpcweb.WrapServer(s)

	logger.Debug("initializing cmux listeners...")
	m := cmux.New(l)
	grpcListener := m.Match(cmux.HTTP2HeaderField("content-type", "application/grpc"))
	grpcWebListener := m.Match(cmux.Any())

	var wg sync.WaitGroup

	logger.Debug("starting servers...")
	wg.Add(1)
	go func() {
		defer wg.Done()
		logger.Debug("starting gRPC server...")
		s.Serve(grpcListener)
	}()

	wg.Add(1)
	go func() {
		defer wg.Done()
		logger.Debug("starting gRPC-web server...")
		http.Serve(
			grpcWebListener,
			httphelper.ContextInjector(
				"controller-grpc [gRPC-web]",
				httphelper.NewRequestLogger(corsHandler(http.HandlerFunc(grpcWebServer.ServeHttp))),
			),
		)
	}()

	wg.Add(1)
	go func() {
		defer wg.Done()
		logger.Debug("starting mux server...")
		m.Serve()
	}()

	wg.Wait()
}

type Config struct {
	DB               *postgres.DB
	q                *que.Client
	appRepo          *data.AppRepo
	artifactRepo     *data.ArtifactRepo
	releaseRepo      *data.ReleaseRepo
	formationRepo    *data.FormationRepo
	deploymentRepo   *data.DeploymentRepo
	eventRepo        *data.EventRepo
	eventListenerMtx sync.Mutex
	eventListener    *data.EventListener
}

func configureRepos(c *Config) *Config {
	c.appRepo = data.NewAppRepo(c.DB, os.Getenv("DEFAULT_ROUTE_DOMAIN"), routerc.New())
	c.artifactRepo = data.NewArtifactRepo(c.DB)
	c.releaseRepo = data.NewReleaseRepo(c.DB, c.artifactRepo, c.q)
	c.formationRepo = data.NewFormationRepo(c.DB, c.appRepo, c.releaseRepo, c.artifactRepo)
	c.eventRepo = data.NewEventRepo(c.DB)
	c.deploymentRepo = data.NewDeploymentRepo(c.DB, c.appRepo, c.releaseRepo, c.formationRepo)
	return c
}

func (c *Config) maybeStartEventListener() (*data.EventListener, error) {
	c.eventListenerMtx.Lock()
	defer c.eventListenerMtx.Unlock()
	if c.eventListener != nil && !c.eventListener.IsClosed() {
		return c.eventListener, nil
	}
	c.eventListener = data.NewEventListener(c.eventRepo)
	return c.eventListener, c.eventListener.Listen()
}

type EventListener struct {
	Events  chan *ct.Event
	Err     error
	errOnce sync.Once
	subs    []*data.EventSubscriber
}

func (e *EventListener) Close() {
	for _, sub := range e.subs {
		sub.Close()
		if err := sub.Err; err != nil {
			e.errOnce.Do(func() { e.Err = err })
		}
	}
}

func (c *Config) subscribeEvents(appIDs []string, objectTypes []ct.EventType, objectID string) (*EventListener, error) {
	dataEventListener, err := c.maybeStartEventListener()
	if err != nil {
		// TODO(jvatic): return proper error code
		return nil, err
	}

	eventListener := &EventListener{
		Events: make(chan *ct.Event),
	}

	objectTypeStrings := make([]string, len(objectTypes))
	for i, t := range objectTypes {
		objectTypeStrings[i] = string(t)
	}

	if len(appIDs) == 0 {
		appIDs = []string{""}
	}
	subs := make([]*data.EventSubscriber, len(appIDs))
	for i, appID := range appIDs {
		sub, err := dataEventListener.Subscribe(appID, objectTypeStrings, objectID)
		if err != nil {
			// TODO(jvatic): return proper error code
			return nil, err
		}
		subs[i] = sub
		go (func() {
			for {
				ctEvent, ok := <-sub.Events
				if !ok {
					break
				}
				eventListener.Events <- ctEvent
			}
		})()
	}
	eventListener.subs = subs
	return eventListener, nil
}

func corsHandler(main http.Handler) http.Handler {
	return (&cors.Options{
		ShouldAllowOrigin: func(origin string, req *http.Request) bool {
			return true
		},
		AllowMethods:     []string{"GET", "POST", "PUT", "PATCH", "DELETE", "HEAD"},
		AllowHeaders:     []string{"Authorization", "Accept", "Content-Type", "If-Match", "If-None-Match", "X-GRPC-Web"},
		ExposeHeaders:    []string{"ETag"},
		AllowCredentials: true,
		MaxAge:           time.Hour,
	}).Handler(main)
}

func NewServer(c *Config) *grpc.Server {
	s := grpc.NewServer(grpc.StatsHandler(&statsHandler{logger: logger.New()}))
	protobuf.RegisterControllerServer(s, &server{Config: c})
	// Register reflection service on gRPC server.
	reflection.Register(s)
	return s
}

type statsHandler struct {
	logger log.Logger
}

func (h *statsHandler) TagRPC(ctx context.Context, info *stats.RPCTagInfo) context.Context {
	logger, ok := ctxhelper.LoggerFromContext(ctx)
	if !ok {
		logger = h.logger
	}
	logger.Info("gRPC request started", "rpcMethod", info.FullMethodName)
	return ctx
}

func (h *statsHandler) HandleRPC(ctx context.Context, s stats.RPCStats) {
}

func (h *statsHandler) TagConn(ctx context.Context, info *stats.ConnTagInfo) context.Context {
	return ctx
}

func (h *statsHandler) HandleConn(ctx context.Context, s stats.ConnStats) {
}

type server struct {
	protobuf.ControllerServer
	*Config
}

func (s *server) listApps(req *protobuf.StreamAppsRequest) ([]*protobuf.App, error) {
	pageSize := int(req.GetPageSize())

	labelFilters := req.GetLabelFilters()
	ctApps, err := s.appRepo.List()
	if err != nil {
		return nil, err
	}

	if pageSize == 0 {
		pageSize = len(ctApps.([]*ct.App))
	}

	apps := make([]*protobuf.App, 0, pageSize)
	n := 0

	appIDs := utils.ParseAppIDsFromNameFilters(req.GetNameFilters())
	if len(appIDs) == 0 {
		appIDs = nil
	}

outer:
	for _, a := range ctApps.([]*ct.App) {
		// filter apps by ID or Name, TODO(jvatic): move this into the data repo
		if appIDs != nil {
			found := false
			for _, appID := range appIDs {
				if a.ID == appID || a.Name == appID {
					found = true
					break
				}
			}
			if !found {
				continue
			}
		}

		for _, f := range labelFilters {
			for _, e := range f.Expressions {
				switch e.Op {
				case protobuf.LabelFilter_Expression_OP_IN: // TODO(jvatic)
				case protobuf.LabelFilter_Expression_OP_NOT_IN:
					for _, ev := range e.Values {
						for k, av := range a.Meta {
							if k != e.Key {
								continue
							}
							if ev == av {
								continue outer
							}
						}
					}
				case protobuf.LabelFilter_Expression_OP_EXISTS: // TODO(jvatic)
				case protobuf.LabelFilter_Expression_OP_NOT_EXISTS: // TODO(jvatic)
				}
			}
		}

		apps = append(apps, utils.ConvertApp(a))
		n++

		if n == pageSize {
			break
		}
	}

	return apps, nil
}

func (s *server) StreamApps(req *protobuf.StreamAppsRequest, stream protobuf.Controller_StreamAppsServer) error {
	unary := !(req.StreamUpdates || req.StreamCreates)

	var apps []*protobuf.App
	var appsMtx sync.RWMutex
	refreshApps := func() error {
		appsMtx.Lock()
		defer appsMtx.Unlock()
		var err error
		apps, err = s.listApps(req)
		return err
	}

	sendResponse := func() {
		appsMtx.RLock()
		stream.Send(&protobuf.StreamAppsResponse{
			Apps:          apps,
			NextPageToken: "", // TODO(jvatic): Pagination
		})
		appsMtx.RUnlock()
	}

	var sub *EventListener
	var err error
	if !unary {
		appIDs := utils.ParseAppIDsFromNameFilters(req.GetNameFilters())
		sub, err = s.subscribeEvents(appIDs, []ct.EventType{ct.EventTypeApp, ct.EventTypeAppDeletion, ct.EventTypeAppRelease}, "")
		if err != nil {
			// TODO(jvatic): return proper error code
			return err
		}
		defer sub.Close()
	}

	if err := refreshApps(); err != nil {
		// TODO(jvatic): return proper error code
		return err
	}
	sendResponse()
	if unary {
		return nil
	}

	var wg sync.WaitGroup
	wg.Add(1)
	go func() {
		defer wg.Done()
		for {
			event, ok := <-sub.Events
			if !ok {
				break
			}
			switch event.ObjectType {
			case ct.EventTypeApp:
				appsMtx.RLock()
				var ctApp *ct.App
				if err := json.Unmarshal(event.Data, &ctApp); err != nil {
					// TODO(jvatic): Handle error
					fmt.Printf("StreamApps: Error unmarshalling event.Data -> App: %s\n", err)
					continue
				}
				app := utils.ConvertApp(ctApp)
				shouldSend := false
				if req.StreamCreates && req.StreamUpdates {
					shouldSend = true
				} else if req.StreamCreates {
					appFound := false
					for _, a := range apps {
						if a.Name == app.Name {
							appFound = true
							break
						}
					}
					shouldSend = !appFound
				} else if req.StreamUpdates {
					for _, a := range apps {
						if a.Name == app.Name {
							shouldSend = true
							break
						}
					}
				}
				if shouldSend {
					stream.Send(&protobuf.StreamAppsResponse{
						Apps: []*protobuf.App{app},
					})
				}
				appsMtx.RUnlock()
			case ct.EventTypeAppDeletion:
				if !req.StreamUpdates {
					continue
				}
				// TODO(jvatic)
			case ct.EventTypeAppRelease:
				if !req.StreamUpdates {
					continue
				}
				// TODO(jvatic)
			}
		}
	}()
	wg.Wait()

	if err := sub.Err; err != nil {
		return utils.ConvertError(err, err.Error())
	}

	return nil
}

func (s *server) UpdateApp(ctx context.Context, req *protobuf.UpdateAppRequest) (*protobuf.App, error) {
	app := req.App
	data := map[string]interface{}{
		"meta": app.Labels,
	}

	if app.Strategy != "" {
		data["strategy"] = app.Strategy
	}

	if app.DeployTimeout > 0 {
		data["deploy_timeout"] = app.DeployTimeout
	}

	if mask := req.GetUpdateMask(); mask != nil {
		if paths := mask.GetPaths(); len(paths) > 0 {
			maskedData := make(map[string]interface{}, len(paths))
			for _, path := range paths {
				if path == "labels" {
					path = "meta"
				}
				if v, ok := data[path]; ok {
					maskedData[path] = v
				}
			}
			data = maskedData
		}
	}

	ctApp, err := s.appRepo.Update(utils.ParseIDFromName(app.Name, "apps"), data)
	if err != nil {
		return nil, utils.ConvertError(err, err.Error())
	}
	return utils.ConvertApp(ctApp.(*ct.App)), nil
}

func (s *server) createScale(req *protobuf.CreateScaleRequest) (*protobuf.ScaleRequest, error) {
	appID := utils.ParseIDFromName(req.Parent, "apps")
	releaseID := utils.ParseIDFromName(req.Parent, "releases")
	processes := parseDeploymentProcesses(req.Processes)
	tags := parseDeploymentTags(req.Tags)

	sub, err := s.subscribeEvents([]string{appID}, []ct.EventType{ct.EventTypeScaleRequest}, "")
	if err != nil {
		// TODO(jvatic): return proper error code
		return nil, err
	}
	defer sub.Close()

	scaleReq := &ct.ScaleRequest{
		AppID:     appID,
		ReleaseID: releaseID,
		State:     ct.ScaleRequestStatePending,
	}
	if processes != nil {
		scaleReq.NewProcesses = &processes
	}
	if tags != nil {
		scaleReq.NewTags = &tags
	}
	if _, err := s.formationRepo.AddScaleRequest(scaleReq, false); err != nil {
		// TODO(jvatic): return proper error code
		return nil, err
	}

	timeout := time.After(ct.DefaultScaleTimeout)
outer:
	for {
		select {
		case event, ok := <-sub.Events:
			if !ok {
				break outer
			}
			switch event.ObjectType {
			case ct.EventTypeScaleRequest:
				var req ct.ScaleRequest
				if err := json.Unmarshal(event.Data, &req); err != nil {
					continue
				}
				if req.ID != scaleReq.ID {
					continue
				}
				switch req.State {
				case ct.ScaleRequestStateCancelled:
					// TODO(jvatic): return proper error code
					return nil, errors.New("scale request cancelled")
				case ct.ScaleRequestStateComplete:
					break outer
				}
			}
		case <-timeout:
			// TODO(jvatic): return proper error code
			return nil, fmt.Errorf("timed out waiting for scale to complete (waited %.f seconds)", ct.DefaultScaleTimeout.Seconds())
		}
	}

	if err := sub.Err; err != nil {
		return nil, utils.ConvertError(err, err.Error())
	}

	return utils.ConvertScaleRequest(scaleReq), nil
}

func (s *server) CreateScale(ctx context.Context, req *protobuf.CreateScaleRequest) (*protobuf.ScaleRequest, error) {
	return s.createScale(req)
}

func (s *server) StreamScales(req *protobuf.StreamScalesRequest, stream protobuf.Controller_StreamScalesServer) error {
	appIDs := utils.ParseAppIDsFromNameFilters(req.NameFilters)

	var scaleRequests []*protobuf.ScaleRequest
	var scaleRequestsMtx sync.RWMutex
	sendResponse := func() {
		scaleRequestsMtx.RLock()
		defer scaleRequestsMtx.RUnlock()
		stream.Send(&protobuf.StreamScalesResponse{
			ScaleRequests: scaleRequests,
		})
	}

	sendResponseWithDelay := func() func() {
		d := 10 * time.Millisecond
		incoming := make(chan struct{})

		go func() {
			t := time.NewTimer(d)
			t.Stop()

			for {
				select {
				case <-incoming:
					t.Reset(d)
				case <-t.C:
					go sendResponse()
				}
			}
		}()

		return func() {
			go func() { incoming <- struct{}{} }()
		}
	}()

	unmarshalScaleRequest := func(event *ct.Event) (*protobuf.ScaleRequest, error) {
		var ctReq *ct.ScaleRequest
		if err := json.Unmarshal(event.Data, &ctReq); err != nil {
			// TODO(jvatic): return proper error code
			return nil, err
		}
		return utils.ConvertScaleRequest(ctReq), nil
	}

	prependScaleRequest := func(event *ct.Event) error {
		req, err := unmarshalScaleRequest(event)
		if err != nil {
			return err
		}
		scaleRequestsMtx.Lock()
		_scaleRequests := make([]*protobuf.ScaleRequest, 0, len(scaleRequests)+1)
		_scaleRequests = append(_scaleRequests, req)
		for _, sr := range scaleRequests {
			if sr.GetName() == req.GetName() {
				continue
			}
			_scaleRequests = append(_scaleRequests, sr)
		}
		scaleRequests = _scaleRequests
		scaleRequestsMtx.Unlock()
		return nil
	}

	sub, err := s.subscribeEvents(appIDs, []ct.EventType{ct.EventTypeScaleRequest}, "")
	if err != nil {
		// TODO(jvatic): return proper error code
		return err
	}
	defer sub.Close()

	// get all events up until now
	var currID int64
	list, err := s.eventRepo.ListEvents(appIDs, []string{string(ct.EventTypeScaleRequest)}, "", nil, nil, 0)
	if err != nil {
		// TODO(jvatic): return proper error code
		return err
	}
	// list is in DESC order, so iterate in reverse
	for i := len(list) - 1; i >= 0; i-- {
		event := list[i]
		currID = event.ID
		if err := prependScaleRequest(event); err != nil {
			// TODO(jvatic): Handle error
			fmt.Printf("ScaleRequestsStream(%v): Error parsing data: %s\n", req.NameFilters, err)
			continue
		}
	}
	sendResponse()

	// stream new events as they are created
	var wg sync.WaitGroup
	wg.Add(1)
	go func() {
		defer wg.Done()
		for {
			sendResponseWithDelay()

			event, ok := <-sub.Events
			if !ok {
				break
			}

			// avoid overlap between list and stream
			if event.ID <= currID {
				continue
			}
			currID = event.ID

			if err := prependScaleRequest(event); err != nil {
				// TODO(jvatic): Handle error
				fmt.Printf("ScaleRequestsStream(%v): Error parsing data: %s\n", req.NameFilters, err)
				continue
			}
		}
	}()
	wg.Wait()

	// TODO(jvatic): return proper error code
	return sub.Err
}

func (s *server) StreamReleases(req *protobuf.StreamReleasesRequest, stream protobuf.Controller_StreamReleasesServer) error {
	appIDs := utils.ParseAppIDsFromNameFilters(req.NameFilters)

	var releases []*protobuf.Release
	var releasesMtx sync.RWMutex
	sendResponse := func() {
		releasesMtx.RLock()
		defer releasesMtx.RUnlock()
		stream.Send(&protobuf.StreamReleasesResponse{
			Releases: releases,
		})
	}

	sendResponseWithDelay := func() func() {
		d := 10 * time.Millisecond
		incoming := make(chan struct{})

		go func() {
			t := time.NewTimer(d)
			t.Stop()

			for {
				select {
				case <-incoming:
					t.Reset(d)
				case <-t.C:
					go sendResponse()
				}
			}
		}()

		return func() {
			go func() { incoming <- struct{}{} }()
		}
	}()

	unmarshalRelease := func(event *ct.Event) (*protobuf.Release, error) {
		var ctRelease *ct.Release
		if err := json.Unmarshal(event.Data, &ctRelease); err != nil {
			// TODO(jvatic): return proper error code
			return nil, err
		}
		return utils.ConvertRelease(ctRelease), nil
	}

	prependRelease := func(event *ct.Event) error {
		req, err := unmarshalRelease(event)
		if err != nil {
			return err
		}
		releasesMtx.Lock()
		_releases := make([]*protobuf.Release, 0, len(releases)+1)
		_releases = append(_releases, req)
		for _, sr := range releases {
			if sr.GetName() == req.GetName() {
				continue
			}
			_releases = append(_releases, sr)
		}
		releases = _releases
		releasesMtx.Unlock()
		return nil
	}

	sub, err := s.subscribeEvents(appIDs, []ct.EventType{ct.EventTypeRelease}, "")
	if err != nil {
		// TODO(jvatic): return proper error code
		return err
	}
	defer sub.Close()

	// get all events up until now
	var currID int64
	list, err := s.eventRepo.ListEvents(appIDs, []string{string(ct.EventTypeRelease)}, "", nil, nil, 0)
	if err != nil {
		// TODO(jvatic): return proper error code
		return err
	}
	// list is in DESC order, so iterate in reverse
	for i := len(list) - 1; i >= 0; i-- {
		event := list[i]
		currID = event.ID
		if err := prependRelease(event); err != nil {
			// TODO(jvatic): Handle error
			fmt.Printf("ReleasesStream(%v): Error parsing data: %s\n", req.NameFilters, err)
			continue
		}
	}
	sendResponse()

	// stream new events as they are created
	var wg sync.WaitGroup
	wg.Add(1)
	go func() {
		defer wg.Done()
		for {
			sendResponseWithDelay()

			event, ok := <-sub.Events
			if !ok {
				break
			}

			// avoid overlap between list and stream
			if event.ID <= currID {
				continue
			}
			currID = event.ID

			if err := prependRelease(event); err != nil {
				// TODO(jvatic): Handle error
				fmt.Printf("ReleasesStream(%v): Error parsing data: %s\n", req.NameFilters, err)
				continue
			}
		}
	}()
	wg.Wait()

	// TODO(jvatic): return proper error code
	return sub.Err
}

func (s *server) StreamFormations(req *protobuf.StreamFormationsRequest, stream protobuf.Controller_StreamFormationsServer) error {
	appIDs := utils.ParseAppIDsFromNameFilters(req.NameFilters)

	var releaseIDs = make(map[string]string) // map[APP_ID]RELEASE_ID
	var releaseIDsMtx sync.RWMutex
	for _, appID := range appIDs {
		ctRelease, err := s.appRepo.GetRelease(appID)
		if err != nil {
			return utils.ConvertError(err, "Error fetching current app release(%v): %s", req.NameFilters, err)
		}
		releaseIDs[appID] = ctRelease.ID
	}

	var formationsMtx sync.RWMutex
	formations := make(map[string]*protobuf.Formation) // map[APP_ID]*protobuf.Formation
	refreshFormation := func(appID, releaseID string) error {
		formationsMtx.Lock()
		defer formationsMtx.Unlock()
		ctFormation, err := s.formationRepo.Get(appID, releaseID)
		if err != nil {
			return err
		}
		ctEFormation, err := s.formationRepo.GetExpanded(appID, releaseID, false)
		if err != nil {
			return err
		}
		formation := utils.ConvertFormation(ctFormation)
		formation.State = protobuf.ScaleRequestState_SCALE_COMPLETE
		if ctEFormation.PendingScaleRequest != nil {
			switch ctEFormation.PendingScaleRequest.State {
			case ct.ScaleRequestStatePending:
				formation.State = protobuf.ScaleRequestState_SCALE_PENDING
			case ct.ScaleRequestStateCancelled:
				formation.State = protobuf.ScaleRequestState_SCALE_CANCELLED
			}
		}

		var scaleReqID string
		if err := s.DB.QueryRow(`SELECT scale_request_id from scale_requests as sr WHERE sr.app_id = $1 AND sr.release_id = $2 ORDER BY sr.updated_at DESC`, appID, releaseID).Scan(&scaleReqID); err != nil {
			return fmt.Errorf("Error fetching scale request id: %v", err)
		}
		formation.ScaleRequest = fmt.Sprintf("apps/%s/releases/%s/scale/%s", appID, releaseID, scaleReqID)
		formations[appID] = formation
		return nil
	}

	sendResponse := func() {
		formationsMtx.RLock()
		if len(formations) > 0 {
			list := make([]*protobuf.Formation, 0, len(formations))
			for _, f := range formations {
				list = append(list, f)
			}
			stream.Send(&protobuf.StreamFormationsResponse{
				Formations: list,
			})
		}
		formationsMtx.RUnlock()
	}

	var wg sync.WaitGroup

	sub, err := s.subscribeEvents(appIDs, []ct.EventType{ct.EventTypeScaleRequest, ct.EventTypeAppRelease}, "")
	if err != nil {
		// TODO(jvatic): return proper error code
		return utils.ConvertError(err, err.Error())
	}
	defer sub.Close()

	errChan := make(chan error, 1)
	defer close(errChan)
	wg.Add(1)
	go func() {
		defer wg.Done()
		for {
			var appID string
			var releaseID string
			if err := refreshFormation(appID, releaseID); err != nil {
				errChan <- utils.ConvertError(err, "Error fetching current app formation(%q, %q): %s", appID, releaseID, err)
				return
			}
			sendResponse()

			// wait for events before refreshing formation and sending respond again
			event, ok := <-sub.Events
			if !ok {
				errChan <- nil
				break
			}
			appID = event.AppID
			// update releaseID whenever a new release is created
			if event.ObjectType == ct.EventTypeAppRelease {
				releaseIDsMtx.Lock()
				releaseIDs[appID] = event.ObjectID
				releaseIDsMtx.Unlock()
			}
			releaseIDsMtx.RLock()
			releaseID = releaseIDs[appID]
			releaseIDsMtx.RUnlock()
		}
	}()
	wg.Wait()

	if err := <-errChan; err != nil {
		return err
	}

	if err := sub.Err; err != nil {
		// TODO(jvatic): return proper error code
		return utils.ConvertError(err, err.Error())
	}

	return nil
}

func (s *server) CreateRelease(ctx context.Context, req *protobuf.CreateReleaseRequest) (*protobuf.Release, error) {
	ctRelease := utils.BackConvertRelease(req.Release)
	ctRelease.AppID = utils.ParseIDFromName(req.Parent, "apps")
	if err := s.releaseRepo.Add(ctRelease); err != nil {
		// TODO(jvatic): return proper error code
		return nil, err
	}
	return utils.ConvertRelease(ctRelease), nil
}

func (s *server) listDeployments(appID string, typeFilters []protobuf.ReleaseType) ([]*protobuf.ExpandedDeployment, error) {
	ctDeployments, err := s.deploymentRepo.List(appID)
	if err != nil {
		return nil, err
	}

	getReleaseType := func(prev, r *protobuf.Release) protobuf.ReleaseType {
		if prev != nil {
			if reflect.DeepEqual(prev.Artifacts, r.Artifacts) {
				return protobuf.ReleaseType_CONFIG
			}
		} else if len(r.Artifacts) == 0 {
			return protobuf.ReleaseType_CONFIG
		}
		return protobuf.ReleaseType_CODE
	}

	var wg sync.WaitGroup
	var deploymentsMtx sync.Mutex
	deployments := make([]*protobuf.ExpandedDeployment, len(ctDeployments))

	for i, ctd := range ctDeployments {
		d := utils.ConvertDeployment(ctd)
		ed := &protobuf.ExpandedDeployment{
			Name:          d.Name,
			Strategy:      d.Strategy,
			Status:        d.Status,
			Processes:     d.Processes,
			Tags:          d.Tags,
			DeployTimeout: d.DeployTimeout,
			CreateTime:    d.CreateTime,
			ExpireTime:    d.ExpireTime,
			EndTime:       d.EndTime,
		}
		if d.OldRelease != "" {
			ed.OldRelease = &protobuf.Release{
				Name: d.OldRelease,
			}
		}
		if d.NewRelease != "" {
			ed.NewRelease = &protobuf.Release{
				Name: d.NewRelease,
			}
		}

		wg.Add(1)
		go func(ed *protobuf.ExpandedDeployment) {
			defer wg.Done()
			var wgInner sync.WaitGroup

			var oldRelease *protobuf.Release
			if ed.OldRelease != nil {
				wgInner.Add(1)
				go func() {
					defer wgInner.Done()
					ctRelease, err := s.releaseRepo.Get(utils.ParseIDFromName(ed.OldRelease.Name, "releases"))
					if err != nil {
						// DEBUG
						fmt.Printf("listDeployments: Error getting OldRelease(%q): %v\n", ed.OldRelease.Name, err)
						return
					}
					oldRelease = utils.ConvertRelease(ctRelease.(*ct.Release))
				}()
			}

			var newRelease *protobuf.Release
			if ed.NewRelease != nil {
				wgInner.Add(1)
				go func() {
					defer wgInner.Done()
					ctRelease, err := s.releaseRepo.Get(utils.ParseIDFromName(ed.NewRelease.Name, "releases"))
					if err != nil {
						// DEBUG
						fmt.Printf("listDeployments: Error getting NewRelease(%q): %v\n", ed.NewRelease.Name, err)
						return
					}
					newRelease = utils.ConvertRelease(ctRelease.(*ct.Release))
				}()
			}

			// wait for releases
			wgInner.Wait()

			deploymentsMtx.Lock()
			ed.Type = getReleaseType(oldRelease, newRelease)

			ed.OldRelease = oldRelease
			ed.NewRelease = newRelease
			deploymentsMtx.Unlock()
		}(ed)

		deploymentsMtx.Lock()
		deployments[i] = ed
		deploymentsMtx.Unlock()
	}

	// wait for releases and deployment types
	wg.Wait()

	var filtered []*protobuf.ExpandedDeployment
	filters := make(map[protobuf.ReleaseType]struct{}, len(typeFilters))
	for _, f := range typeFilters {
		filters[f] = struct{}{}
	}
	if _, ok := filters[protobuf.ReleaseType_ANY]; ok {
		filtered = deployments
	} else {
		filtered = make([]*protobuf.ExpandedDeployment, 0, len(deployments))
		for _, ed := range deployments {
			// filter by type of deployment
			if _, ok := filters[ed.Type]; !ok {
				continue
			}
			filtered = append(filtered, ed)
		}
	}

	return filtered, nil
}

func (s *server) StreamDeployments(req *protobuf.StreamDeploymentsRequest, srv protobuf.Controller_StreamDeploymentsServer) error {
	appIDs := utils.ParseAppIDsFromNameFilters(req.NameFilters)

	var deploymentsMtx sync.RWMutex
	deployments := make(map[string][]*protobuf.ExpandedDeployment)
	refreshDeployments := func(appID string) error {
		deploymentsMtx.Lock()
		defer deploymentsMtx.Unlock()
		var err error
		deployments[appID], err = s.listDeployments(appID, req.TypeFilters)
		return err
	}

	sendResponse := func() {
		deploymentsMtx.RLock()
		list := make([]*protobuf.ExpandedDeployment, 0)
		for _, l := range deployments {
			list = append(list, l...)
		}
		// TODO(jvatic): sort the list
		srv.Send(&protobuf.StreamDeploymentsResponse{
			Deployments: list,
		})
		deploymentsMtx.RUnlock()
	}

	for _, appID := range appIDs {
		if err := refreshDeployments(appID); err != nil {
			return err
		}
	}
	sendResponse()

	var wg sync.WaitGroup

	sub, err := s.subscribeEvents(appIDs, []ct.EventType{ct.EventTypeDeployment}, "")
	if err != nil {
		// TODO(jvatic): return proper error code
		return err
	}
	defer sub.Close()

	wg.Add(1)
	go func() {
		defer wg.Done()
		for {
			ctEvent, ok := <-sub.Events
			if !ok {
				break
			}
			if err := refreshDeployments(ctEvent.AppID); err != nil {
				// DEBUG
				fmt.Printf("StreamDeployments: Error refreshing deployments: %s\n", err)
				continue
			}
			sendResponse()
		}
	}()
	wg.Wait()

	// TODO(jvatic): return proper error code
	return sub.Err
}

func parseDeploymentTags(from map[string]*protobuf.DeploymentProcessTags) map[string]map[string]string {
	to := make(map[string]map[string]string, len(from))
	for k, v := range from {
		to[k] = v.Tags
	}
	return to
}

func parseDeploymentProcesses(from map[string]int32) map[string]int {
	to := make(map[string]int, len(from))
	for k, v := range from {
		to[k] = int(v)
	}
	return to
}

func (s *server) CreateDeployment(req *protobuf.CreateDeploymentRequest, ds protobuf.Controller_CreateDeploymentServer) error {
	appID := utils.ParseIDFromName(req.Parent, "apps")
	d, err := s.deploymentRepo.Add(appID, utils.ParseIDFromName(req.Release, "releases"))
	if err != nil {
		// TODO(jvatic): return proper error code
		return err
	}

	// Wait for deployment to complete and perform scale

	sub, err := s.subscribeEvents([]string{appID}, []ct.EventType{ct.EventTypeDeployment}, d.ID)
	if err != nil {
		// TODO(jvatic): return proper error code
		return err
	}
	defer sub.Close()

	for {
		ctEvent, ok := <-sub.Events
		if !ok {
			break
		}
		if ctEvent.ObjectType != "deployment" {
			continue
		}
		var de *ct.DeploymentEvent
		if err := json.Unmarshal(ctEvent.Data, &de); err != nil {
			fmt.Printf("Failed to unmarshal deployment event(%s): %s\n", ctEvent.ObjectID, err)
			continue
		}

		d, err := s.deploymentRepo.Get(ctEvent.ObjectID)
		if err != nil {
			fmt.Printf("Failed to get deployment(%s): %s\n", ctEvent.ObjectID, err)
			continue
		}

		// Scale release to requested processes/tags once deployment is complete
		if d.Status == "complete" {
			if sr := req.ScaleRequest; sr != nil {
				s.createScale(&protobuf.CreateScaleRequest{
					Parent:    fmt.Sprintf("apps/%s/releases/%s", d.AppID, d.NewReleaseID),
					Processes: sr.Processes,
					Tags:      sr.Tags,
				})
			}
		}

		ds.Send(&protobuf.DeploymentEvent{
			Deployment: utils.ConvertDeployment(d),
			JobType:    de.JobType,
			JobState:   utils.ConvertDeploymentEventJobState(de.JobState),
			Error:      de.Error,
			CreateTime: utils.TimestampProto(ctEvent.CreatedAt),
		})

		if d.Status == "failed" {
			// TODO(jvatic): return proper error code
			return fmt.Errorf(de.Error)
		}
		if d.Status == "complete" {
			break
		}
	}

	// TODO(jvatic): return proper error code
	return sub.Err
}
