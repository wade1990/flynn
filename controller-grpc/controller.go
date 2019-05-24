//go:generate protoc -I/usr/local/include -I../controller/grpc -I${GOPATH}/src/github.com/grpc-ecosystem/grpc-gateway/third_party/googleapis --go_out=plugins=grpc:. ../controller/grpc/controller.proto
package main

import (
	"encoding/json"
	fmt "fmt"
	"net/http"
	"os"
	"path"
	"reflect"
	"strings"
	"sync"
	"syscall"
	"time"

	controller "github.com/flynn/flynn/controller/client"
	controllerschema "github.com/flynn/flynn/controller/schema"
	ct "github.com/flynn/flynn/controller/types"
	"github.com/flynn/flynn/host/resource"
	"github.com/flynn/flynn/host/types"
	"github.com/flynn/flynn/pkg/cors"
	"github.com/flynn/flynn/pkg/httphelper"
	"github.com/flynn/flynn/pkg/postgres"
	"github.com/flynn/flynn/pkg/shutdown"
	que "github.com/flynn/que-go"
	"github.com/golang/protobuf/ptypes"
	durpb "github.com/golang/protobuf/ptypes/duration"
	tspb "github.com/golang/protobuf/ptypes/timestamp"
	"github.com/improbable-eng/grpc-web/go/grpcweb"
	"github.com/opencontainers/runc/libcontainer/configs"
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

	s := NewServer(&Config{
		Client: client,
		DB:     db,
		q:      q,
	})

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
	Client controller.Client
	DB     *postgres.DB
	q      *que.Client
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
	RegisterControllerServer(s, &server{Config: c})
	// Register reflection service on gRPC server.
	reflection.Register(s)
	return s
}

type server struct {
	ControllerServer
	*Config
}

func convertApp(a *ct.App) *App {
	var releaseName string
	if a.ReleaseID != "" {
		releaseName = path.Join("apps", a.ID, "releases", a.ReleaseID)
	}
	return &App{
		Name:          path.Join("apps", a.ID),
		DisplayName:   a.Name,
		Labels:        a.Meta,
		Strategy:      a.Strategy,
		Release:       releaseName,
		DeployTimeout: a.DeployTimeout,
		CreateTime:    timestampProto(a.CreatedAt),
		UpdateTime:    timestampProto(a.UpdatedAt),
	}
}

func (s *server) listApps() ([]*App, error) {
	ctApps, err := s.Client.AppList()
	if err != nil {
		return nil, err
	}
	apps := make([]*App, len(ctApps))
	for i, a := range ctApps {
		apps[i] = convertApp(a)
	}
	return apps, nil
}

func (s *server) ListApps(ctx context.Context, req *ListAppsRequest) (*ListAppsResponse, error) {
	apps, err := s.listApps()
	if err != nil {
		return nil, err
	}
	return &ListAppsResponse{
		Apps:          apps,
		NextPageToken: "", // TODO(jvatic): pagination
	}, nil
}

func (s *server) StreamApps(req *ListAppsRequest, stream Controller_StreamAppsServer) error {
	var apps []*App
	var appsMtx sync.RWMutex
	refreshApps := func() error {
		appsMtx.Lock()
		defer appsMtx.Unlock()
		var err error
		apps, err = s.listApps()
		return err
	}

	sendResponse := func() {
		appsMtx.RLock()
		stream.Send(&ListAppsResponse{
			Apps:          apps,
			NextPageToken: "", // TODO(jvatic): Pagination
		})
		appsMtx.RUnlock()
	}

	var wg sync.WaitGroup

	events := make(chan *ct.Event)
	eventStream, err := s.Client.StreamEvents(ct.StreamEventsOptions{
		ObjectTypes: []ct.EventType{ct.EventTypeApp, ct.EventTypeAppDeletion, ct.EventTypeAppRelease},
	}, events)
	if err != nil {
		return err
	}

	wg.Add(1)
	go func() {
		defer wg.Done()
		for {
			if err := refreshApps(); err != nil {
				fmt.Printf("StreamApps: Error refreshing apps: %s\n", err)
				continue
			}
			sendResponse()

			if _, ok := <-events; !ok {
				break
			}
		}
	}()
	wg.Wait()

	if err := eventStream.Close(); err != nil {
		return err
	}

	return eventStream.Err()
}

func (s *server) GetApp(ctx context.Context, req *GetAppRequest) (*App, error) {
	ctApp, err := s.Client.GetApp(parseIDFromName(req.Name, "apps"))
	if err != nil {
		return nil, err
	}
	return convertApp(ctApp), nil
}

func (s *server) StreamApp(req *GetAppRequest, stream Controller_StreamAppServer) error {
	var app *App
	var appMtx sync.RWMutex
	appID := parseIDFromName(req.Name, "apps")

	if appID == "" {
		return grpc.Errorf(codes.InvalidArgument, "StreamApp Error: Invalid app name: %q", req.Name)
	}

	refreshApp := func() error {
		appMtx.Lock()
		defer appMtx.Unlock()
		ctApp, err := s.Client.GetApp(appID)
		if err != nil {
			return err
		}
		app = convertApp(ctApp)
		return nil
	}

	sendResponse := func() {
		appMtx.RLock()
		stream.Send(app)
		appMtx.RUnlock()
	}

	var wg sync.WaitGroup

	events := make(chan *ct.Event)
	eventStream, err := s.Client.StreamEvents(ct.StreamEventsOptions{
		AppID:       appID,
		ObjectTypes: []ct.EventType{ct.EventTypeApp, ct.EventTypeAppDeletion, ct.EventTypeAppRelease},
	}, events)
	if err != nil {
		return err
	}

	errChan := make(chan error, 1)
	defer close(errChan)
	wg.Add(1)
	go func() {
		defer wg.Done()
		for {
			if err := refreshApp(); err != nil {
				errChan <- convertError(err, "Error refreshing app(%q): %s", req.Name, err)
				return
			} else {
				sendResponse()
			}

			// wait for events before refreshing app and sending respond again
			if _, ok := <-events; !ok {
				errChan <- nil
				break
			}
		}
	}()
	wg.Wait()

	if err := <-errChan; err != nil {
		eventStream.Close()
		return err
	}

	if err := eventStream.Close(); err != nil {
		return convertError(err, err.Error())
	}

	if err := eventStream.Err(); err != nil {
		return convertError(err, err.Error())
	}

	return nil
}

func backConvertApp(a *App) *ct.App {
	return &ct.App{
		ID:            parseIDFromName(a.Name, "apps"),
		Name:          a.DisplayName,
		Meta:          a.Labels,
		Strategy:      a.Strategy,
		ReleaseID:     parseIDFromName(a.Release, "releases"),
		DeployTimeout: a.DeployTimeout,
		CreatedAt:     timestampFromProto(a.CreateTime),
		UpdatedAt:     timestampFromProto(a.UpdateTime),
	}
}

func (s *server) UpdateApp(ctx context.Context, req *UpdateAppRequest) (*App, error) {
	ctApp := backConvertApp(req.App)
	// TODO(jvatic): implement req.UpdateMask
	if err := s.Client.UpdateAppMeta(ctApp); err != nil {
		return nil, err
	}
	return convertApp(ctApp), nil
}

func convertPorts(from []ct.Port) []*Port {
	to := make([]*Port, len(from))
	for i, p := range from {
		to[i] = &Port{
			Port:    int32(p.Port),
			Proto:   p.Proto,
			Service: convertService(p.Service),
		}
	}
	return to
}

func backConvertPorts(from []*Port) []ct.Port {
	to := make([]ct.Port, len(from))
	for i, p := range from {
		to[i] = ct.Port{
			Port:    int(p.Port),
			Proto:   p.Proto,
			Service: backConvertService(p.Service),
		}
	}
	return to
}

func convertService(from *host.Service) *HostService {
	// TODO(jvatic)
	return &HostService{}
}

func backConvertService(from *HostService) *host.Service {
	// TODO(jvatic)
	return &host.Service{}
}

func convertVolumes(from []ct.VolumeReq) []*VolumeReq {
	// TODO(jvatic)
	return []*VolumeReq{}
}

func backConvertVolumes(from []*VolumeReq) []ct.VolumeReq {
	// TODO(jvatic)
	return []ct.VolumeReq{}
}

func convertResources(from resource.Resources) map[string]*HostResourceSpec {
	// TODO(jvatic)
	return map[string]*HostResourceSpec{}
}

func backConvertResources(from map[string]*HostResourceSpec) resource.Resources {
	// TODO(jvatic)
	return resource.Resources{}
}

func convertMounts(from []host.Mount) []*HostMount {
	// TODO(jvatic)
	return []*HostMount{}
}

func backConvertMounts(from []*HostMount) []host.Mount {
	// TODO(jvatic)
	return []host.Mount{}
}

func convertAllowedDevices(from []*configs.Device) []*LibContainerDevice {
	// TODO(jvatic)
	return []*LibContainerDevice{}
}

func backConvertAllowedDevices(from []*LibContainerDevice) []*configs.Device {
	// TODO(jvatic)
	return []*configs.Device{}
}

func convertProcesses(from map[string]ct.ProcessType) map[string]*ProcessType {
	to := make(map[string]*ProcessType, len(from))
	for k, t := range from {
		to[k] = &ProcessType{
			Args:              t.Args,
			Env:               t.Env,
			Ports:             convertPorts(t.Ports),
			Volumes:           convertVolumes(t.Volumes),
			Omni:              t.Omni,
			HostNetwork:       t.HostNetwork,
			HostPidNamespace:  t.HostPIDNamespace,
			Service:           t.Service,
			Resurrect:         t.Resurrect,
			Resources:         convertResources(t.Resources),
			Mounts:            convertMounts(t.Mounts),
			LinuxCapabilities: t.LinuxCapabilities,
			AllowedDevices:    convertAllowedDevices(t.AllowedDevices),
			WriteableCgroups:  t.WriteableCgroups,
		}
	}
	return to
}

func backConvertProcesses(from map[string]*ProcessType) map[string]ct.ProcessType {
	to := make(map[string]ct.ProcessType, len(from))
	for k, t := range from {
		to[k] = ct.ProcessType{
			Args:              t.Args,
			Env:               t.Env,
			Ports:             backConvertPorts(t.Ports),
			Volumes:           backConvertVolumes(t.Volumes),
			Omni:              t.Omni,
			HostNetwork:       t.HostNetwork,
			HostPIDNamespace:  t.HostPidNamespace,
			Service:           t.Service,
			Resurrect:         t.Resurrect,
			Resources:         backConvertResources(t.Resources),
			Mounts:            backConvertMounts(t.Mounts),
			LinuxCapabilities: t.LinuxCapabilities,
			AllowedDevices:    backConvertAllowedDevices(t.AllowedDevices),
			WriteableCgroups:  t.WriteableCgroups,
		}
	}
	return to
}

func convertRelease(r *ct.Release) *Release {
	return &Release{
		Name:       fmt.Sprintf("apps/%s/releases/%s", r.AppID, r.ID),
		Artifacts:  r.ArtifactIDs,
		Env:        r.Env,
		Labels:     r.Meta,
		Processes:  convertProcesses(r.Processes),
		CreateTime: timestampProto(r.CreatedAt),
	}
}

func (s *server) GetAppRelease(ctx context.Context, req *GetAppReleaseRequest) (*Release, error) {
	appID := parseIDFromName(req.Parent, "apps")
	if appID == "" {
		return nil, controller.ErrNotFound
	}
	release, err := s.Client.GetAppRelease(appID)
	if err != nil {
		return nil, err
	}
	return convertRelease(release), nil
}

func (s *server) StreamAppRelease(req *GetAppReleaseRequest, stream Controller_StreamAppReleaseServer) error {
	var release *Release
	var releaseMtx sync.RWMutex
	appID := parseIDFromName(req.Parent, "apps")
	refreshRelease := func() error {
		releaseMtx.Lock()
		defer releaseMtx.Unlock()
		ctRelease, err := s.Client.GetAppRelease(appID)
		if err != nil {
			return err
		}
		release = convertRelease(ctRelease)
		return nil
	}

	sendResponse := func() {
		releaseMtx.RLock()
		stream.Send(release)
		releaseMtx.RUnlock()
	}

	var wg sync.WaitGroup

	events := make(chan *ct.Event)
	eventStream, err := s.Client.StreamEvents(ct.StreamEventsOptions{
		AppID:       appID,
		ObjectTypes: []ct.EventType{ct.EventTypeAppRelease},
	}, events)
	if err != nil {
		return err
	}

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
				errChan <- convertError(err, "Error fetching app(%q) release: %s", req.Parent, err)
				return
			} else {
				sendResponse()
			}

			// wait for events before refreshing release and sending respond again
			if _, ok := <-events; !ok {
				errChan <- nil
				break
			}
		}
	}()
	wg.Wait()

	if err := <-errChan; err != nil {
		eventStream.Close()
		return err
	}

	if err := eventStream.Close(); err != nil {
		return convertError(err, err.Error())
	}

	if err := eventStream.Err(); err != nil {
		return convertError(err, err.Error())
	}

	return nil
}

func convertScaleRequest(ctScaleReq *ct.ScaleRequest) *ScaleRequest {
	state := ScaleRequestState_SCALE_PENDING
	switch ctScaleReq.State {
	case ct.ScaleRequestStateCancelled:
		state = ScaleRequestState_SCALE_CANCELLED
	case ct.ScaleRequestStateComplete:
		state = ScaleRequestState_SCALE_COMPLETE
	}

	var newProcesses map[string]int32
	if ctScaleReq.NewProcesses != nil {
		newProcesses = convertDeploymentProcesses(*ctScaleReq.NewProcesses)
	}

	var newTags map[string]*DeploymentProcessTags
	if ctScaleReq.NewTags != nil {
		newTags = convertDeploymentTags(*ctScaleReq.NewTags)
	}

	return &ScaleRequest{
		Parent:       fmt.Sprintf("apps/%s/releases/%s", ctScaleReq.AppID, ctScaleReq.ReleaseID),
		Name:         fmt.Sprintf("apps/%s/releases/%s/scale/%s", ctScaleReq.AppID, ctScaleReq.ReleaseID, ctScaleReq.ID),
		State:        state,
		OldProcesses: convertDeploymentProcesses(ctScaleReq.OldProcesses),
		NewProcesses: newProcesses,
		OldTags:      convertDeploymentTags(ctScaleReq.OldTags),
		NewTags:      newTags,
		CreateTime:   timestampProto(ctScaleReq.CreatedAt),
		UpdateTime:   timestampProto(ctScaleReq.UpdatedAt),
	}
}

func (s *server) CreateScale(ctx context.Context, req *CreateScaleRequest) (*ScaleRequest, error) {
	appID := parseIDFromName(req.Parent, "apps")
	releaseID := parseIDFromName(req.Parent, "releases")
	var scaleReq *ScaleRequest
	if err := s.Client.ScaleAppRelease(appID, releaseID, ct.ScaleOptions{
		Processes: parseDeploymentProcesses(req.Processes),
		Tags:      parseDeploymentTags(req.Tags),
		ScaleRequestCallback: func(r *ct.ScaleRequest) {
			scaleReq = convertScaleRequest(r)
		},
	}); err != nil {
		return nil, err
	}
	return scaleReq, nil
}

func (s *server) StreamScaleRequests(req *ListScaleRequestsRequest, stream Controller_StreamScaleRequestsServer) error {
	appID := parseIDFromName(req.Parent, "apps")

	events := make(chan *ct.Event)
	eventStream, err := s.Client.StreamEvents(ct.StreamEventsOptions{
		AppID:       appID,
		ObjectTypes: []ct.EventType{ct.EventTypeScaleRequest},
		Past:        true,
	}, events)
	if err != nil {
		return err
	}

	var scaleRequests []*ScaleRequest
	var scaleRequestsMtx sync.RWMutex
	sendResponse := func() {
		scaleRequestsMtx.RLock()
		defer scaleRequestsMtx.RUnlock()
		stream.Send(&ListScaleRequestsResponse{
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
			req := convertScaleRequest(ctReq)
			// prepend
			scaleRequestsMtx.Lock()
			_scaleRequests := make([]*ScaleRequest, 0, len(scaleRequests)+1)
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

func convertFormation(ctFormation *ct.Formation) *Formation {
	return &Formation{
		Parent:     fmt.Sprintf("apps/%s/releases/%s", ctFormation.AppID, ctFormation.ReleaseID),
		Processes:  convertDeploymentProcesses(ctFormation.Processes),
		Tags:       convertDeploymentTags(ctFormation.Tags),
		CreateTime: timestampProto(ctFormation.CreatedAt),
		UpdateTime: timestampProto(ctFormation.UpdatedAt),
	}
}

func convertError(err error, message string, args ...interface{}) error {
	errCode := codes.Unknown
	if err == controller.ErrNotFound {
		errCode = codes.NotFound
	}
	return grpc.Errorf(errCode, fmt.Sprintf(message, args...))
}

func (s *server) StreamAppFormation(req *GetAppFormationRequest, stream Controller_StreamAppFormationServer) error {
	appID := parseIDFromName(req.Parent, "apps")

	var releaseID string
	var releaseIDMtx sync.RWMutex
	ctRelease, err := s.Client.GetAppRelease(appID)
	if err != nil {
		return convertError(err, "Error fetching current app release(%q): %s", req.Parent, err)
	}
	releaseID = ctRelease.ID

	var formation *Formation
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
		formation = convertFormation(ctFormation)
		formation.State = ScaleRequestState_SCALE_COMPLETE
		if ctEFormation.PendingScaleRequest != nil {
			switch ctEFormation.PendingScaleRequest.State {
			case ct.ScaleRequestStatePending:
				formation.State = ScaleRequestState_SCALE_PENDING
			case ct.ScaleRequestStateCancelled:
				formation.State = ScaleRequestState_SCALE_CANCELLED
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
		return convertError(err, err.Error())
	}

	errChan := make(chan error, 1)
	defer close(errChan)
	wg.Add(1)
	go func() {
		defer wg.Done()
		for {
			if err := refreshFormation(); err != nil {
				errChan <- convertError(err, "Error fetching current app formation(%q): %s", req.Parent, err)
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
		return convertError(err, err.Error())
	}

	if err := eventStream.Err(); err != nil {
		return convertError(err, err.Error())
	}

	return nil
}

func (s *server) GetRelease(ctx context.Context, req *GetReleaseRequest) (*Release, error) {
	releaseID := parseIDFromName(req.Name, "releases")
	if releaseID == "" {
		return nil, controller.ErrNotFound
	}
	release, err := s.Client.GetRelease(releaseID)
	if err != nil {
		return nil, err
	}
	return convertRelease(release), nil
}

func (s *server) listDeployments(req *ListDeploymentsRequest) ([]*ExpandedDeployment, error) {
	appID := parseIDFromName(req.Parent, "apps")
	ctDeployments, err := s.Client.DeploymentList(appID)
	if err != nil {
		return nil, err
	}

	// DEBUG
	fmt.Printf("listDeployments: Got %d for %q (%q)\n", len(ctDeployments), appID, req.Parent)

	getReleaseType := func(prev, r *Release) ReleaseType {
		if prev != nil {
			if reflect.DeepEqual(prev.Artifacts, r.Artifacts) {
				return ReleaseType_CONFIG
			}
		} else if len(r.Artifacts) == 0 {
			return ReleaseType_CONFIG
		}
		return ReleaseType_CODE
	}

	var wg sync.WaitGroup
	var deploymentsMtx sync.Mutex
	deployments := make([]*ExpandedDeployment, len(ctDeployments))

	for i, ctd := range ctDeployments {
		d := convertDeployment(ctd)
		ed := &ExpandedDeployment{
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
			ed.OldRelease = &Release{
				Name: d.OldRelease,
			}
		}
		if d.NewRelease != "" {
			ed.NewRelease = &Release{
				Name: d.NewRelease,
			}
		}

		wg.Add(1)
		go func(ed *ExpandedDeployment) {
			defer wg.Done()
			var wgInner sync.WaitGroup

			var oldRelease *Release
			if ed.OldRelease != nil {
				wgInner.Add(1)
				go func() {
					defer wgInner.Done()
					ctRelease, err := s.Client.GetRelease(parseIDFromName(ed.OldRelease.Name, "releases"))
					if err != nil {
						// DEBUG
						fmt.Printf("listDeployments: Error getting OldRelease(%q): %v\n", ed.OldRelease.Name, err)
						return
					}
					oldRelease = convertRelease(ctRelease)
				}()
			}

			var newRelease *Release
			if ed.NewRelease != nil {
				wgInner.Add(1)
				go func() {
					defer wgInner.Done()
					ctRelease, err := s.Client.GetRelease(parseIDFromName(ed.NewRelease.Name, "releases"))
					if err != nil {
						// DEBUG
						fmt.Printf("listDeployments: Error getting NewRelease(%q): %v\n", ed.NewRelease.Name, err)
						return
					}
					newRelease = convertRelease(ctRelease)
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

	var filtered []*ExpandedDeployment
	if req.FilterType == ReleaseType_ANY {
		filtered = deployments
	} else {
		filtered = make([]*ExpandedDeployment, 0, len(deployments))
		for _, ed := range deployments {
			// DEBUG
			fmt.Printf("listDeployments: Filtering deployment %v == %v ?\n", req.FilterType, ed.Type)

			// filter by type of deployment
			if req.FilterType != ReleaseType_ANY && ed.Type != req.FilterType {
				continue
			}
			filtered = append(filtered, ed)
		}
	}

	// DEBUG
	fmt.Printf("listDeployments: Responding with %d\n", len(filtered))

	return filtered, nil
}

func (s *server) StreamDeployments(req *ListDeploymentsRequest, srv Controller_StreamDeploymentsServer) error {
	var deployments []*ExpandedDeployment
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
		srv.Send(&ListDeploymentsResponse{
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

func (s *server) StreamAppLog(*StreamAppLogRequest, Controller_StreamAppLogServer) error {
	return nil
}

func (s *server) CreateRelease(ctx context.Context, req *CreateReleaseRequest) (*Release, error) {
	r := req.Release
	ctRelease := &ct.Release{
		ArtifactIDs: r.Artifacts,
		Env:         r.Env,
		Meta:        r.Labels,
		Processes:   backConvertProcesses(r.Processes),
	}
	if err := s.Client.CreateRelease(parseIDFromName(req.Parent, "apps"), ctRelease); err != nil {
		return nil, err
	}
	return convertRelease(ctRelease), nil
}

func parseDeploymentTags(from map[string]*DeploymentProcessTags) map[string]map[string]string {
	to := make(map[string]map[string]string, len(from))
	for k, v := range from {
		to[k] = v.Tags
	}
	return to
}

func convertDeploymentTags(from map[string]map[string]string) map[string]*DeploymentProcessTags {
	to := make(map[string]*DeploymentProcessTags, len(from))
	for k, v := range from {
		to[k] = &DeploymentProcessTags{Tags: v}
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

func convertDeploymentProcesses(from map[string]int) map[string]int32 {
	to := make(map[string]int32, len(from))
	for k, v := range from {
		to[k] = int32(v)
	}
	return to
}

func convertDeploymentStatus(from string) DeploymentStatus {
	switch from {
	case "pending":
		return DeploymentStatus_PENDING
	case "failed":
		return DeploymentStatus_FAILED
	case "running":
		return DeploymentStatus_RUNNING
	case "complete":
		return DeploymentStatus_COMPLETE
	}
	return DeploymentStatus_PENDING
}

func convertDeployment(from *ct.Deployment) *Deployment {
	return &Deployment{
		Name:          fmt.Sprintf("apps/%s/deployments/%s", from.AppID, from.ID),
		OldRelease:    fmt.Sprintf("apps/%s/releases/%s", from.AppID, from.OldReleaseID),
		NewRelease:    fmt.Sprintf("apps/%s/releases/%s", from.AppID, from.NewReleaseID),
		Strategy:      from.Strategy,
		Status:        convertDeploymentStatus(from.Status),
		Processes:     convertDeploymentProcesses(from.Processes),
		Tags:          convertDeploymentTags(from.Tags),
		DeployTimeout: from.DeployTimeout,
		CreateTime:    timestampProto(from.CreatedAt),
		EndTime:       timestampProto(from.FinishedAt),
	}
}

func convertDeploymentEventJobState(from ct.JobState) DeploymentEvent_JobState {
	switch from {
	case "pending":
		return DeploymentEvent_PENDING
	case "blocked":
		return DeploymentEvent_BLOCKED
	case "starting":
		return DeploymentEvent_STARTING
	case "up":
		return DeploymentEvent_UP
	case "stopping":
		return DeploymentEvent_STOPPING
	case "down":
		return DeploymentEvent_DOWN
	case "crashed":
		return DeploymentEvent_CRASHED
	case "failed":
		return DeploymentEvent_FAILED
	}
	return DeploymentEvent_PENDING
}

func (s *server) CreateDeployment(req *CreateDeploymentRequest, ds Controller_CreateDeploymentServer) error {
	d, err := s.Client.CreateDeployment(parseIDFromName(req.Parent, "apps"), parseIDFromName(req.Release, "releases"))
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

		ds.Send(&Event{
			DeploymentEvent: &DeploymentEvent{
				Deployment: convertDeployment(d),
				JobType:    de.JobType,
				JobState:   convertDeploymentEventJobState(de.JobState),
			},
			Error:      de.Error,
			CreateTime: timestampProto(ctEvent.CreatedAt),
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

func convertEventTypeSlice(in []string) []ct.EventType {
	out := make([]ct.EventType, len(in))
	for i, t := range in {
		out[i] = ct.EventType(t)
	}
	return out
}

func parseIDFromName(name string, resource string) string {
	parts := strings.Split(name, "/")
	idMap := make(map[string]string, len(parts)/2)
	for i := 0; i < len(parts)-1; i += 2 {
		if i == len(parts) {
			return idMap[resource]
		}
		resourceName := parts[i]
		resourceID := parts[i+1]
		idMap[resourceName] = resourceID
	}
	return idMap[resource]
}

func lastResourceName(name string) string {
	parts := strings.Split(name, "/")
	if len(parts) == 0 {
		return ""
	}
	return parts[len(parts)-1]
}

func parseProtoDuration(dur *durpb.Duration) time.Duration {
	d, _ := ptypes.Duration(dur)
	return d
}

func timestampProto(t *time.Time) *tspb.Timestamp {
	if t == nil {
		return nil
	}
	tp, _ := ptypes.TimestampProto(*t)
	return tp
}

func timestampFromProto(t *tspb.Timestamp) *time.Time {
	if t == nil {
		return nil
	}
	ts, _ := ptypes.Timestamp(t)
	return &ts
}
