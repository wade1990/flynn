//go:generate protoc -I/usr/local/include -I../controller/grpc -I${GOPATH}/src/github.com/grpc-ecosystem/grpc-gateway/third_party/googleapis --go_out=plugins=grpc:./protobuf ../controller/grpc/controller.proto
package main

import (
	"encoding/json"
	"errors"
	fmt "fmt"
	"net/http"
	"os"
	"reflect"
	"sync"
	"syscall"
	"time"

	"github.com/flynn/flynn/controller-grpc/protobuf"
	"github.com/flynn/flynn/controller-grpc/utils"
	controller "github.com/flynn/flynn/controller/client"
	"github.com/flynn/flynn/controller/data"
	controllerschema "github.com/flynn/flynn/controller/schema"
	ct "github.com/flynn/flynn/controller/types"
	"github.com/flynn/flynn/pkg/cors"
	"github.com/flynn/flynn/pkg/httphelper"
	"github.com/flynn/flynn/pkg/postgres"
	"github.com/flynn/flynn/pkg/shutdown"
	routerc "github.com/flynn/flynn/router/client"
	que "github.com/flynn/que-go"
	"github.com/improbable-eng/grpc-web/go/grpcweb"
	"golang.org/x/net/context"
	"google.golang.org/grpc"
	codes "google.golang.org/grpc/codes"
	"google.golang.org/grpc/reflection"
)

func mustEnv(key string) string {
	if val, ok := os.LookupEnv(key); ok {
		return val
	}
	panic(fmt.Errorf("%s is required", key))
}

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

	client, err := controller.NewClient(mustEnv("CONTROLLER_DOMAIN"), mustEnv("CONTROLLER_AUTH_KEY"))
	if err != nil {
		shutdown.Fatal(fmt.Errorf("error initializing controller client: %s", err))
	}

	// Open connection to main controller database
	db := postgres.Wait(nil, controllerschema.PrepareStatements)
	shutdown.BeforeExit(func() { db.Close() })
	q := que.NewClient(db.ConnPool)

	s := NewServer(configureRepos(&Config{
		Client: client,
		DB:     db,
		q:      q,
	}))

	wrappedServer := grpcweb.WrapServer(s)

	port := os.Getenv("PORT")
	if port == "" {
		port = "3000"
	}
	addr := ":" + port
	shutdown.Fatal(
		http.ListenAndServe(
			addr,
			httphelper.ContextInjector(
				"controller-grpc",
				httphelper.NewRequestLogger(corsHandler(http.HandlerFunc(func(w http.ResponseWriter, req *http.Request) {
					if wrappedServer.IsGrpcWebRequest(req) {
						wrappedServer.ServeHttp(w, req)
					}
					// Fall back to other servers.
					http.DefaultServeMux.ServeHTTP(w, req)
				}))),
			),
		),
	)
}

type Config struct {
	Client           controller.Client
	DB               *postgres.DB
	q                *que.Client
	appRepo          *data.AppRepo
	artifactRepo     *data.ArtifactRepo
	releaseRepo      *data.ReleaseRepo
	formationRepo    *data.FormationRepo
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
	s := grpc.NewServer()
	protobuf.RegisterControllerServer(s, &server{Config: c})
	// Register reflection service on gRPC server.
	reflection.Register(s)
	return s
}

type server struct {
	protobuf.ControllerServer
	*Config
}

func (s *server) listApps(req *protobuf.ListAppsRequest) ([]*protobuf.App, error) {
	labelsExclusionFilter := req.GetLabelsExclusionFilter()
	ctApps, err := s.appRepo.List()
	if err != nil {
		return nil, err
	}
	apps := make([]*protobuf.App, 0, len(ctApps.([]*ct.App)))

outer:
	for _, a := range ctApps.([]*ct.App) {
		for ek, ev := range labelsExclusionFilter {
			for k, v := range a.Meta {
				if ek == k && ev == v {
					continue outer
				}
			}
		}
		apps = append(apps, utils.ConvertApp(a))
	}

	return apps, nil
}

func (s *server) StreamApps(req *protobuf.ListAppsRequest, stream protobuf.Controller_StreamAppsServer) error {
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
		stream.Send(&protobuf.ListAppsResponse{
			Apps:          apps,
			NextPageToken: "", // TODO(jvatic): Pagination
		})
		appsMtx.RUnlock()
	}

	var wg sync.WaitGroup

	eventListener, err := s.maybeStartEventListener()
	if err != nil {
		// TODO(jvatic): return proper error code
		return err
	}

	sub, err := eventListener.Subscribe("", []string{string(ct.EventTypeApp), string(ct.EventTypeAppDeletion), string(ct.EventTypeAppRelease)}, "")
	if err != nil {
		// TODO(jvatic): return proper error code
		return err
	}
	defer sub.Close()

	wg.Add(1)
	go func() {
		defer wg.Done()
		for {
			if err := refreshApps(); err != nil {
				fmt.Printf("StreamApps: Error refreshing apps: %s\n", err)
				continue
			}
			sendResponse()

			if _, ok := <-sub.Events; !ok {
				break
			}
		}
	}()
	wg.Wait()

	if err := sub.Err; err != nil {
		return utils.ConvertError(err, err.Error())
	}

	return nil
}

func (s *server) StreamApp(req *protobuf.GetAppRequest, stream protobuf.Controller_StreamAppServer) error {
	var app *protobuf.App
	var appMtx sync.RWMutex
	appID := utils.ParseIDFromName(req.Name, "apps")

	if appID == "" {
		return grpc.Errorf(codes.InvalidArgument, "StreamApp Error: Invalid app name: %q", req.Name)
	}

	refreshApp := func() error {
		appMtx.Lock()
		defer appMtx.Unlock()
		ctApp, err := s.appRepo.Get(appID)
		if err != nil {
			return err
		}
		app = utils.ConvertApp(ctApp.(*ct.App))
		return nil
	}

	sendResponse := func() {
		appMtx.RLock()
		stream.Send(app)
		appMtx.RUnlock()
	}

	var wg sync.WaitGroup

	eventListener, err := s.maybeStartEventListener()
	if err != nil {
		// TODO(jvatic): return proper error code
		return err
	}

	sub, err := eventListener.Subscribe(appID, []string{string(ct.EventTypeApp), string(ct.EventTypeAppDeletion), string(ct.EventTypeAppRelease)}, "")
	if err != nil {
		// TODO(jvatic): return proper error code
		return err
	}
	defer sub.Close()

	errChan := make(chan error, 1)
	defer close(errChan)
	wg.Add(1)
	go func() {
		defer wg.Done()
		for {
			if err := refreshApp(); err != nil {
				errChan <- utils.ConvertError(err, "Error refreshing app(%q): %s", req.Name, err)
				return
			} else {
				sendResponse()
			}

			// wait for events before refreshing app and sending respond again
			if _, ok := <-sub.Events; !ok {
				errChan <- nil
				break
			}
		}
	}()
	wg.Wait()

	if err := <-errChan; err != nil {
		return err
	}

	if err := sub.Err; err != nil {
		return utils.ConvertError(err, err.Error())
	}

	return nil
}

func (s *server) UpdateApp(ctx context.Context, req *protobuf.UpdateAppRequest) (*protobuf.App, error) {
	data := map[string]interface{}{
		"strategy":       req.App.Strategy,
		"meta":           req.App.Labels,
		"deploy_timeout": req.App.DeployTimeout,
	}
	if mask := req.GetUpdateMask(); mask != nil {
		for _, path := range mask.GetPaths() {
			if path == "labels" {
				path = "meta"
			}
			if _, ok := data[path]; ok {
				delete(data, path)
			}
		}
	}
	ctApp, err := s.appRepo.Update(utils.ParseIDFromName(req.App.Name, "apps"), data)
	if err != nil {
		return nil, utils.ConvertError(err, err.Error())
	}
	return utils.ConvertApp(ctApp.(*ct.App)), nil
}

func (s *server) StreamAppRelease(req *protobuf.GetAppReleaseRequest, stream protobuf.Controller_StreamAppReleaseServer) error {
	var release *protobuf.Release
	var releaseMtx sync.RWMutex
	appID := utils.ParseIDFromName(req.Parent, "apps")
	refreshRelease := func() error {
		releaseMtx.Lock()
		defer releaseMtx.Unlock()
		ctRelease, err := s.appRepo.GetRelease(appID)
		if err != nil {
			return err
		}
		release = utils.ConvertRelease(ctRelease)
		return nil
	}

	sendResponse := func() {
		releaseMtx.RLock()
		stream.Send(release)
		releaseMtx.RUnlock()
	}

	var wg sync.WaitGroup

	eventListener, err := s.maybeStartEventListener()
	if err != nil {
		// TODO(jvatic): return proper error code
		return err
	}

	sub, err := eventListener.Subscribe(appID, []string{string(ct.EventTypeAppRelease)}, "")
	if err != nil {
		// TODO(jvatic): return proper error code
		return err
	}
	defer sub.Close()

	errChan := make(chan error, 1)
	defer close(errChan)
	wg.Add(1)
	go func() {
		defer wg.Done()
		for {
			if err := refreshRelease(); err != nil {
				if err != controller.ErrNotFound {
					fmt.Printf("StreamAppRelease(%q): Error refreshing app release: %s\n", req.Parent, err)
				}
				errChan <- utils.ConvertError(err, "Error fetching app(%q) release: %s", req.Parent, err)
				return
			} else {
				sendResponse()
			}

			// wait for events before refreshing release and sending respond again
			if _, ok := <-sub.Events; !ok {
				errChan <- nil
				break
			}
		}
	}()
	wg.Wait()

	if err := <-errChan; err != nil {
		return err
	}

	if err := sub.Err; err != nil {
		return utils.ConvertError(err, err.Error())
	}

	return nil
}

func (s *server) CreateScale(ctx context.Context, req *protobuf.CreateScaleRequest) (*protobuf.ScaleRequest, error) {
	appID := utils.ParseIDFromName(req.Parent, "apps")
	releaseID := utils.ParseIDFromName(req.Parent, "releases")
	processes := parseDeploymentProcesses(req.Processes)
	tags := parseDeploymentTags(req.Tags)

	eventListener, err := s.maybeStartEventListener()
	if err != nil {
		// TODO(jvatic): return proper error code
		return nil, err
	}

	sub, err := eventListener.Subscribe(appID, []string{string(ct.EventTypeScaleRequest)}, "")
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

func (s *server) StreamScaleRequests(req *protobuf.ListScaleRequestsRequest, stream protobuf.Controller_StreamScaleRequestsServer) error {
	appID := utils.ParseIDFromName(req.Parent, "apps")

	events := make(chan *ct.Event)
	eventStream, err := s.Client.StreamEvents(ct.StreamEventsOptions{
		AppID:       appID,
		ObjectTypes: []ct.EventType{ct.EventTypeScaleRequest},
		Past:        true,
	}, events)
	if err != nil {
		return err
	}

	var scaleRequests []*protobuf.ScaleRequest
	var scaleRequestsMtx sync.RWMutex
	sendResponse := func() {
		scaleRequestsMtx.RLock()
		defer scaleRequestsMtx.RUnlock()
		stream.Send(&protobuf.ListScaleRequestsResponse{
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

	var wg sync.WaitGroup
	wg.Add(1)
	go func() {
		defer wg.Done()
		for {
			sendResponseWithDelay()

			event, ok := <-events
			if !ok {
				break
			}
			var ctReq *ct.ScaleRequest
			if err := json.Unmarshal(event.Data, &ctReq); err != nil {
				// TODO(jvatic): Handle error
				fmt.Printf("ScaleRequestsStream(%q): Error parsing data: %s\n", req.Parent, err)
				continue
			}
			req := utils.ConvertScaleRequest(ctReq)
			// prepend
			scaleRequestsMtx.Lock()
			_scaleRequests := make([]*protobuf.ScaleRequest, 0, len(scaleRequests)+1)
			_scaleRequests = append(_scaleRequests, req)
			for _, s := range scaleRequests {
				if s.Name != req.Name {
					_scaleRequests = append(_scaleRequests, s)
				}
			}
			scaleRequests = _scaleRequests
			scaleRequestsMtx.Unlock()
		}
	}()
	wg.Wait()

	if err := eventStream.Close(); err != nil {
		return err
	}

	return eventStream.Err()
}

func (s *server) StreamAppFormation(req *protobuf.GetAppFormationRequest, stream protobuf.Controller_StreamAppFormationServer) error {
	appID := utils.ParseIDFromName(req.Parent, "apps")

	var releaseID string
	var releaseIDMtx sync.RWMutex
	ctRelease, err := s.Client.GetAppRelease(appID)
	if err != nil {
		return utils.ConvertError(err, "Error fetching current app release(%q): %s", req.Parent, err)
	}
	releaseID = ctRelease.ID

	var formation *protobuf.Formation
	var formationMtx sync.RWMutex
	refreshFormation := func() error {
		releaseIDMtx.RLock()
		defer releaseIDMtx.RUnlock()
		formationMtx.Lock()
		defer formationMtx.Unlock()
		ctFormation, err := s.Client.GetFormation(appID, releaseID)
		if err != nil {
			return err
		}
		ctEFormation, err := s.Client.GetExpandedFormation(appID, ctRelease.ID)
		if err != nil {
			return err
		}
		formation = utils.ConvertFormation(ctFormation)
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
		return nil
	}

	sendResponse := func() {
		formationMtx.RLock()
		if formation != nil {
			stream.Send(formation)
		}
		formationMtx.RUnlock()
	}

	var wg sync.WaitGroup

	events := make(chan *ct.Event)
	eventStream, err := s.Client.StreamEvents(ct.StreamEventsOptions{
		AppID:       appID,
		ObjectTypes: []ct.EventType{ct.EventTypeScaleRequest, ct.EventTypeAppRelease},
	}, events)
	if err != nil {
		return utils.ConvertError(err, err.Error())
	}

	errChan := make(chan error, 1)
	defer close(errChan)
	wg.Add(1)
	go func() {
		defer wg.Done()
		for {
			if err := refreshFormation(); err != nil {
				errChan <- utils.ConvertError(err, "Error fetching current app formation(%q): %s", req.Parent, err)
				return
			}
			sendResponse()

			// wait for events before refreshing formation and sending respond again
			event, ok := <-events
			if !ok {
				errChan <- nil
				break
			}
			// update releaseID whenever a new release is created
			if event.ObjectType == ct.EventTypeAppRelease {
				releaseIDMtx.Lock()
				releaseID = event.ObjectID
				releaseIDMtx.Unlock()
			}
		}
	}()
	wg.Wait()

	if err := <-errChan; err != nil {
		eventStream.Close()
		return err
	}

	if err := eventStream.Close(); err != nil {
		return utils.ConvertError(err, err.Error())
	}

	if err := eventStream.Err(); err != nil {
		return utils.ConvertError(err, err.Error())
	}

	return nil
}

func (s *server) GetRelease(ctx context.Context, req *protobuf.GetReleaseRequest) (*protobuf.Release, error) {
	releaseID := utils.ParseIDFromName(req.Name, "releases")
	if releaseID == "" {
		return nil, controller.ErrNotFound
	}
	release, err := s.Client.GetRelease(releaseID)
	if err != nil {
		return nil, err
	}
	return utils.ConvertRelease(release), nil
}

func (s *server) StreamAppLog(*protobuf.StreamAppLogRequest, protobuf.Controller_StreamAppLogServer) error {
	return nil
}

func (s *server) CreateRelease(ctx context.Context, req *protobuf.CreateReleaseRequest) (*protobuf.Release, error) {
	r := req.Release
	ctRelease := &ct.Release{
		ArtifactIDs: r.Artifacts,
		Env:         r.Env,
		Meta:        r.Labels,
		Processes:   utils.BackConvertProcesses(r.Processes),
	}
	if err := s.Client.CreateRelease(utils.ParseIDFromName(req.Parent, "apps"), ctRelease); err != nil {
		return nil, err
	}
	return utils.ConvertRelease(ctRelease), nil
}

func (s *server) listDeployments(req *protobuf.ListDeploymentsRequest) ([]*protobuf.ExpandedDeployment, error) {
	appID := utils.ParseIDFromName(req.Parent, "apps")
	ctDeployments, err := s.Client.DeploymentList(appID)
	if err != nil {
		return nil, err
	}

	// DEBUG
	fmt.Printf("listDeployments: Got %d for %q (%q)\n", len(ctDeployments), appID, req.Parent)

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
					ctRelease, err := s.Client.GetRelease(utils.ParseIDFromName(ed.OldRelease.Name, "releases"))
					if err != nil {
						// DEBUG
						fmt.Printf("listDeployments: Error getting OldRelease(%q): %v\n", ed.OldRelease.Name, err)
						return
					}
					oldRelease = utils.ConvertRelease(ctRelease)
				}()
			}

			var newRelease *protobuf.Release
			if ed.NewRelease != nil {
				wgInner.Add(1)
				go func() {
					defer wgInner.Done()
					ctRelease, err := s.Client.GetRelease(utils.ParseIDFromName(ed.NewRelease.Name, "releases"))
					if err != nil {
						// DEBUG
						fmt.Printf("listDeployments: Error getting NewRelease(%q): %v\n", ed.NewRelease.Name, err)
						return
					}
					newRelease = utils.ConvertRelease(ctRelease)
				}()
			}

			// wait for releases
			wgInner.Wait()

			deploymentsMtx.Lock()
			ed.Type = getReleaseType(oldRelease, newRelease)

			// DEBUG
			fmt.Printf("listDeployments: Got type(%v)\n", ed.Type)

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
	if req.FilterType == protobuf.ReleaseType_ANY {
		filtered = deployments
	} else {
		filtered = make([]*protobuf.ExpandedDeployment, 0, len(deployments))
		for _, ed := range deployments {
			// DEBUG
			fmt.Printf("listDeployments: Filtering deployment %v == %v ?\n", req.FilterType, ed.Type)

			// filter by type of deployment
			if req.FilterType != protobuf.ReleaseType_ANY && ed.Type != req.FilterType {
				continue
			}
			filtered = append(filtered, ed)
		}
	}

	// DEBUG
	fmt.Printf("listDeployments: Responding with %d\n", len(filtered))

	return filtered, nil
}

func (s *server) StreamDeployments(req *protobuf.ListDeploymentsRequest, srv protobuf.Controller_StreamDeploymentsServer) error {
	var deployments []*protobuf.ExpandedDeployment
	var deploymentsMtx sync.RWMutex
	refreshDeployments := func() error {
		deploymentsMtx.Lock()
		defer deploymentsMtx.Unlock()
		var err error
		deployments, err = s.listDeployments(req)
		return err
	}

	sendResponse := func() {
		deploymentsMtx.RLock()
		srv.Send(&protobuf.ListDeploymentsResponse{
			Deployments: deployments,
		})
		deploymentsMtx.RUnlock()
	}

	if err := refreshDeployments(); err != nil {
		return err
	}
	sendResponse()

	var wg sync.WaitGroup

	events := make(chan *ct.Event)
	eventStream, err := s.Client.StreamEvents(ct.StreamEventsOptions{
		ObjectTypes: []ct.EventType{ct.EventTypeDeployment},
	}, events)
	if err != nil {
		return err
	}

	wg.Add(1)
	go func() {
		defer wg.Done()
		for {
			if _, ok := <-events; !ok {
				break
			}
			if err := refreshDeployments(); err != nil {
				// DEBUG
				fmt.Printf("StreamDeployments: Error refreshing deployments: %s\n", err)
				continue
			}
			sendResponse()
		}
	}()
	wg.Wait()

	if err := eventStream.Close(); err != nil {
		return err
	}

	return eventStream.Err()
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
	d, err := s.Client.CreateDeployment(utils.ParseIDFromName(req.Parent, "apps"), utils.ParseIDFromName(req.Release, "releases"))
	if err != nil {
		return err
	}
	events := make(chan *ct.Event)
	eventStream, err := s.Client.StreamEvents(ct.StreamEventsOptions{
		AppID:       d.AppID,
		ObjectID:    d.ID,
		ObjectTypes: []ct.EventType{ct.EventTypeDeployment},
		Past:        true,
	}, events)
	if err != nil {
		return err
	}

	for {
		ctEvent, ok := <-events
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

		d, err := s.Client.GetDeployment(ctEvent.ObjectID)
		if err != nil {
			fmt.Printf("Failed to get deployment(%s): %s\n", ctEvent.ObjectID, err)
			continue
		}

		// Scale release to requested processes/tags once deployment is complete
		if d.Status == "complete" {
			if req.ScaleRequest != nil {
				s.Client.ScaleAppRelease(d.AppID, d.NewReleaseID, ct.ScaleOptions{
					Processes: parseDeploymentProcesses(req.ScaleRequest.Processes),
					Tags:      parseDeploymentTags(req.ScaleRequest.Tags),
				})
			}
		}

		ds.Send(&protobuf.Event{
			DeploymentEvent: &protobuf.DeploymentEvent{
				Deployment: utils.ConvertDeployment(d),
				JobType:    de.JobType,
				JobState:   utils.ConvertDeploymentEventJobState(de.JobState),
			},
			Error:      de.Error,
			CreateTime: utils.TimestampProto(ctEvent.CreatedAt),
		})

		if d.Status == "failed" {
			return fmt.Errorf(de.Error)
		}
		if d.Status == "complete" {
			break
		}
	}

	if err := eventStream.Close(); err != nil {
		return err
	}

	return eventStream.Err()
}
