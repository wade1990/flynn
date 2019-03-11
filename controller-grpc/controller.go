//go:generate protoc -I/usr/local/include -I../controller/grpc -I${GOPATH}/src/github.com/grpc-ecosystem/grpc-gateway/third_party/googleapis --go_out=plugins=grpc:. ../controller/grpc/controller.proto
package main

import (
	"encoding/json"
	fmt "fmt"
	"io"
	"net/http"
	"os"
	"path"
	"strings"
	"sync"
	"time"

	controller "github.com/flynn/flynn/controller/client"
	ct "github.com/flynn/flynn/controller/types"
	"github.com/flynn/flynn/host/resource"
	"github.com/flynn/flynn/host/types"
	"github.com/flynn/flynn/pkg/cors"
	"github.com/flynn/flynn/pkg/httphelper"
	"github.com/flynn/flynn/pkg/shutdown"
	"github.com/golang/protobuf/ptypes"
	durpb "github.com/golang/protobuf/ptypes/duration"
	tspb "github.com/golang/protobuf/ptypes/timestamp"
	"github.com/improbable-eng/grpc-web/go/grpcweb"
	"github.com/opencontainers/runc/libcontainer/configs"
	"golang.org/x/net/context"
	"google.golang.org/grpc"
	"google.golang.org/grpc/reflection"
)

func mustEnv(key string) string {
	if val, ok := os.LookupEnv(key); ok {
		return val
	}
	panic(fmt.Errorf("%s is required", key))
}

func main() {
	client, err := controller.NewClient(mustEnv("CONTROLLER_DOMAIN"), mustEnv("CONTROLLER_AUTH_KEY"))
	if err != nil {
		shutdown.Fatal(fmt.Errorf("error initializing controller client: %s", err))
	}
	s := NewServer(&Config{
		Client: client,
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

func (s *server) ListAppsStream(stream Controller_ListAppsStreamServer) error {
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

	wg.Add(1)
	go func() {
		defer wg.Done()
		for {
			_, err := stream.Recv()
			if err != nil {
				fmt.Printf("ListAppsStream: Error receiving request: %s\n", err)
				break
			}
			// TODO(jvatic): Pagination
			if err := refreshApps(); err != nil {
				fmt.Printf("ListAppsStream: Error refreshing apps: %s\n", err)
				continue
			}
			sendResponse()
		}
	}()

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
			if _, ok := <-events; !ok {
				break
			}
			if err := refreshApps(); err != nil {
				fmt.Printf("ListAppsStream: Error refreshing apps: %s\n", err)
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

	wg.Add(1)
	go func() {
		defer wg.Done()
		for {
			if err := refreshApp(); err != nil {
				fmt.Printf("StreamApp: Error refreshing app: %s\n", err)
				continue
			}
			sendResponse()

			// wait for events before refreshing app and sending respond again
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
	if err := s.Client.UpdateApp(ctApp); err != nil {
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

	wg.Add(1)
	go func() {
		defer wg.Done()
		for {
			if err := refreshRelease(); err != nil {
				fmt.Printf("StreamApp: Error refreshing app: %s\n", err)
				continue
			}
			sendResponse()

			// wait for events before refreshing release and sending respond again
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

func convertFormation(ctFormation *ct.Formation) *Formation {
	return &Formation{
		Name:       fmt.Sprintf("apps/%s/formations/%s", ctFormation.AppID, ctFormation.ReleaseID),
		Processes:  convertDeploymentProcesses(ctFormation.Processes),
		Tags:       convertDeploymentTags(ctFormation.Tags),
		CreateTime: timestampProto(ctFormation.CreatedAt),
		UpdateTime: timestampProto(ctFormation.UpdatedAt),
	}
}

func (s *server) UpdateFormation(ctx context.Context, req *UpdateFormationRequest) (*Formation, error) {
	appID := parseIDFromName(req.Parent, "apps")
	releaseID := parseIDFromName(req.Parent, "formations")
	formation := req.Formation
	ctFormation := &ct.Formation{
		AppID:     appID,
		ReleaseID: releaseID,
		Processes: parseDeploymentProcesses(formation.Processes),
		Tags:      parseDeploymentTags(formation.Tags),
		CreatedAt: timestampFromProto(formation.CreateTime),
		UpdatedAt: timestampFromProto(formation.UpdateTime),
	}
	if err := s.Client.PutFormation(ctFormation); err != nil {
		return nil, err
	}
	return convertFormation(ctFormation), nil
}

func (s *server) StreamAppFormation(req *GetAppFormationRequest, stream Controller_StreamAppFormationServer) error {
	var formation *Formation
	var formationMtx sync.RWMutex
	appID := parseIDFromName(req.Parent, "apps")
	refreshFormation := func() error {
		formationMtx.Lock()
		defer formationMtx.Unlock()
		ctRelease, err := s.Client.GetAppRelease(appID)
		if err != nil {
			return err
		}
		ctFormation, err := s.Client.GetFormation(appID, ctRelease.ID)
		if err != nil {
			return err
		}
		formation = convertFormation(ctFormation)
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
		ObjectTypes: []ct.EventType{ct.EventTypeScaleRequest},
	}, events)
	if err != nil {
		return err
	}

	wg.Add(1)
	go func() {
		defer wg.Done()
		for {
			if err := refreshFormation(); err != nil {
				fmt.Printf("StreamAppFormation: Error refreshing formation: %s\n", err)
			}
			sendResponse()

			// wait for events before refreshing formation and sending respond again
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

func (s *server) listReleases(req *ListReleasesRequest) ([]*Release, error) {
	appID := parseIDFromName(req.Parent, "apps")
	var ctReleases []*ct.Release
	if appID == "" {
		res, err := s.Client.ReleaseList()
		if err != nil {
			return nil, err
		}
		ctReleases = res
	} else {
		res, err := s.Client.AppReleaseList(appID)
		if err != nil {
			return nil, err
		}
		ctReleases = res
	}

	releases := make([]*Release, len(ctReleases))
	for i, r := range ctReleases {
		releases[i] = convertRelease(r)
	}

	var filtered []*Release
	if len(req.FilterLabels) == 0 {
		filtered = releases
	} else {
		filtered = make([]*Release, 0, len(releases))
		for _, r := range releases {
			for fk, fv := range req.FilterLabels {
				rv, ok := r.Labels[fk]
				if rv == fv || (ok && fv == "*") {
					filtered = append(filtered, r)
					break
				}
			}
		}
	}

	return filtered, nil
}

func (s *server) ListReleases(ctx context.Context, req *ListReleasesRequest) (*ListReleasesResponse, error) {
	releases, err := s.listReleases(req)
	if err != nil {
		return nil, err
	}
	return &ListReleasesResponse{Releases: releases}, nil
}

func (s *server) ListReleasesStream(stream Controller_ListReleasesStreamServer) error {
	var req *ListReleasesRequest
	var reqMtx sync.RWMutex
	var releases []*Release
	var releasesMtx sync.RWMutex
	refreshReleases := func() error {
		releasesMtx.Lock()
		defer releasesMtx.Unlock()
		reqMtx.RLock()
		defer reqMtx.RUnlock()
		var err error
		if req != nil {
			releases, err = s.listReleases(req)
		}
		return err
	}

	sendResponse := func() {
		releasesMtx.RLock()
		stream.Send(&ListReleasesResponse{
			Releases:      releases,
			NextPageToken: "", // TODO(jvatic): Pagination
		})
		releasesMtx.RUnlock()
	}

	var wg sync.WaitGroup

	wg.Add(1)
	go func() {
		defer wg.Done()
		for {
			r, err := stream.Recv()
			if err != nil {
				if err != io.EOF {
					fmt.Printf("ListReleasesStream: Error receiving request: %s\n", err)
				}
				break
			}
			reqMtx.Lock()
			req = r
			reqMtx.Unlock()
			// TODO(jvatic): Pagination
			if err := refreshReleases(); err != nil {
				fmt.Printf("ListReleasesStream: Error refreshing releases: %s\n", err)
				continue
			}
			sendResponse()
		}
	}()

	events := make(chan *ct.Event)
	eventStream, err := s.Client.StreamEvents(ct.StreamEventsOptions{
		ObjectTypes: []ct.EventType{ct.EventTypeRelease, ct.EventTypeReleaseDeletion},
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
			if err := refreshReleases(); err != nil {
				fmt.Printf("ListReleasesStream: Error refreshing releases: %s\n", err)
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
		ds.Send(&Event{
			Name:   fmt.Sprintf("events/%d", ctEvent.ID),
			Parent: fmt.Sprintf("apps/%s/deployments/%s", d.AppID, d.ID),
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

func (s *server) StreamEvents(req *StreamEventsRequest, es Controller_StreamEventsServer) error {
	events := make(chan *ct.Event)
	eventStream, err := s.Client.StreamEvents(ct.StreamEventsOptions{
		AppID:       parseIDFromName(req.Parent, "apps"),
		ObjectTypes: convertEventTypeSlice(req.ObjectTypes),
		ObjectID:    lastResourceName(req.Name),
		Past:        req.Past,
		Count:       int(req.Count),
	}, events)
	if err != nil {
		return err
	}

	for {
		ctEvent, ok := <-events
		if !ok {
			break
		}

		event := &Event{
			Name:       fmt.Sprintf("events/%d", ctEvent.ID),
			Type:       string(ctEvent.ObjectType),
			CreateTime: timestampProto(ctEvent.CreatedAt),
		}

		switch ctEvent.ObjectType {
		case ct.EventTypeApp, ct.EventTypeAppDeletion:
			event.Parent = fmt.Sprintf("apps/%s", ctEvent.ObjectID)
			var ctApp *ct.App
			if err := json.Unmarshal(ctEvent.Data, &ctApp); err != nil {
				fmt.Printf("Failed to unmarshal app event(%s): %s\n", ctEvent.ObjectID, err)
				continue
			}
			event.App = convertApp(ctApp)
		case ct.EventTypeAppRelease, ct.EventTypeRelease, ct.EventTypeReleaseDeletion:
			event.Parent = fmt.Sprintf("apps/%s/releases/%s", ctEvent.AppID, ctEvent.ObjectID)
			var ctRelease *ct.Release
			if err := json.Unmarshal(ctEvent.Data, &ctRelease); err != nil {
				fmt.Printf("Failed to unmarshal release event(%s): %s\n", ctEvent.ObjectID, err)
				continue
			}
			event.Release = convertRelease(ctRelease)
		case ct.EventTypeDeployment:
			event.Parent = fmt.Sprintf("apps/%s/deployments/%s", ctEvent.AppID, ctEvent.ObjectID)
			var ctDeploymentEvent *ct.DeploymentEvent
			if err := json.Unmarshal(ctEvent.Data, &ctDeploymentEvent); err != nil {
				fmt.Printf("Failed to unmarshal deployment event(%s): %s\n", ctEvent.ObjectID, err)
				continue
			}
			ctDeployment, err := s.Client.GetDeployment(ctEvent.ObjectID)
			if err != nil {
				fmt.Printf("Failed to get deployment(%s): %s\n", ctEvent.ObjectID, err)
				continue
			}
			event.DeploymentEvent = &DeploymentEvent{
				JobType:    ctDeploymentEvent.JobType,
				JobState:   convertDeploymentEventJobState(ctDeploymentEvent.JobState),
				Deployment: convertDeployment(ctDeployment),
			}
			event.Error = ctDeploymentEvent.Error
		case ct.EventTypeRoute, ct.EventTypeRouteDeletion:
			event.Parent = fmt.Sprintf("apps/%s/routes/%s", ctEvent.AppID, ctEvent.ObjectID)
		}

		es.Send(event)
	}

	if err := eventStream.Close(); err != nil {
		return err
	}
	return eventStream.Err()
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
