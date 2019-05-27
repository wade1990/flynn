package utils

import (
	"fmt"
	"path"
	"strings"
	"time"

	"github.com/flynn/flynn/controller-grpc/protobuf"
	controller "github.com/flynn/flynn/controller/client"
	ct "github.com/flynn/flynn/controller/types"
	"github.com/flynn/flynn/host/resource"
	host "github.com/flynn/flynn/host/types"
	"github.com/golang/protobuf/ptypes"
	tspb "github.com/golang/protobuf/ptypes/timestamp"
	"github.com/opencontainers/runc/libcontainer/configs"
	"google.golang.org/grpc"
	"google.golang.org/grpc/codes"
)

func TimestampProto(t *time.Time) *tspb.Timestamp {
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

func ParseIDFromName(name string, resource string) string {
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

func ConvertApp(a *ct.App) *protobuf.App {
	var releaseName string
	if a.ReleaseID != "" {
		releaseName = path.Join("apps", a.ID, "releases", a.ReleaseID)
	}
	return &protobuf.App{
		Name:          path.Join("apps", a.ID),
		DisplayName:   a.Name,
		Labels:        a.Meta,
		Strategy:      a.Strategy,
		Release:       releaseName,
		DeployTimeout: a.DeployTimeout,
		CreateTime:    TimestampProto(a.CreatedAt),
		UpdateTime:    TimestampProto(a.UpdatedAt),
	}
}

func ConvertPorts(from []ct.Port) []*protobuf.Port {
	to := make([]*protobuf.Port, len(from))
	for i, p := range from {
		to[i] = &protobuf.Port{
			Port:    int32(p.Port),
			Proto:   p.Proto,
			Service: ConvertService(p.Service),
		}
	}
	return to
}

func ConvertService(from *host.Service) *protobuf.HostService {
	// TODO(jvatic)
	return &protobuf.HostService{}
}

func ConvertVolumes(from []ct.VolumeReq) []*protobuf.VolumeReq {
	// TODO(jvatic)
	return []*protobuf.VolumeReq{}
}

func ConvertResources(from resource.Resources) map[string]*protobuf.HostResourceSpec {
	// TODO(jvatic)
	return map[string]*protobuf.HostResourceSpec{}
}

func ConvertMounts(from []host.Mount) []*protobuf.HostMount {
	// TODO(jvatic)
	return []*protobuf.HostMount{}
}

func ConvertAllowedDevices(from []*configs.Device) []*protobuf.LibContainerDevice {
	// TODO(jvatic)
	return []*protobuf.LibContainerDevice{}
}

func ConvertProcesses(from map[string]ct.ProcessType) map[string]*protobuf.ProcessType {
	to := make(map[string]*protobuf.ProcessType, len(from))
	for k, t := range from {
		to[k] = &protobuf.ProcessType{
			Args:              t.Args,
			Env:               t.Env,
			Ports:             ConvertPorts(t.Ports),
			Volumes:           ConvertVolumes(t.Volumes),
			Omni:              t.Omni,
			HostNetwork:       t.HostNetwork,
			HostPidNamespace:  t.HostPIDNamespace,
			Service:           t.Service,
			Resurrect:         t.Resurrect,
			Resources:         ConvertResources(t.Resources),
			Mounts:            ConvertMounts(t.Mounts),
			LinuxCapabilities: t.LinuxCapabilities,
			AllowedDevices:    ConvertAllowedDevices(t.AllowedDevices),
			WriteableCgroups:  t.WriteableCgroups,
		}
	}
	return to
}

func ConvertRelease(r *ct.Release) *protobuf.Release {
	return &protobuf.Release{
		Name:       fmt.Sprintf("apps/%s/releases/%s", r.AppID, r.ID),
		Artifacts:  r.ArtifactIDs,
		Env:        r.Env,
		Labels:     r.Meta,
		Processes:  ConvertProcesses(r.Processes),
		CreateTime: TimestampProto(r.CreatedAt),
	}
}

func ConvertScaleRequest(ctScaleReq *ct.ScaleRequest) *protobuf.ScaleRequest {
	state := protobuf.ScaleRequestState_SCALE_PENDING
	switch ctScaleReq.State {
	case ct.ScaleRequestStateCancelled:
		state = protobuf.ScaleRequestState_SCALE_CANCELLED
	case ct.ScaleRequestStateComplete:
		state = protobuf.ScaleRequestState_SCALE_COMPLETE
	}

	var newProcesses map[string]int32
	if ctScaleReq.NewProcesses != nil {
		newProcesses = ConvertDeploymentProcesses(*ctScaleReq.NewProcesses)
	}

	var newTags map[string]*protobuf.DeploymentProcessTags
	if ctScaleReq.NewTags != nil {
		newTags = ConvertDeploymentTags(*ctScaleReq.NewTags)
	}

	return &protobuf.ScaleRequest{
		Parent:       fmt.Sprintf("apps/%s/releases/%s", ctScaleReq.AppID, ctScaleReq.ReleaseID),
		Name:         fmt.Sprintf("apps/%s/releases/%s/scale/%s", ctScaleReq.AppID, ctScaleReq.ReleaseID, ctScaleReq.ID),
		State:        state,
		OldProcesses: ConvertDeploymentProcesses(ctScaleReq.OldProcesses),
		NewProcesses: newProcesses,
		OldTags:      ConvertDeploymentTags(ctScaleReq.OldTags),
		NewTags:      newTags,
		CreateTime:   TimestampProto(ctScaleReq.CreatedAt),
		UpdateTime:   TimestampProto(ctScaleReq.UpdatedAt),
	}
}

func ConvertFormation(ctFormation *ct.Formation) *protobuf.Formation {
	return &protobuf.Formation{
		Parent:     fmt.Sprintf("apps/%s/releases/%s", ctFormation.AppID, ctFormation.ReleaseID),
		Processes:  ConvertDeploymentProcesses(ctFormation.Processes),
		Tags:       ConvertDeploymentTags(ctFormation.Tags),
		CreateTime: TimestampProto(ctFormation.CreatedAt),
		UpdateTime: TimestampProto(ctFormation.UpdatedAt),
	}
}

func ConvertError(err error, message string, args ...interface{}) error {
	errCode := codes.Unknown
	if err == controller.ErrNotFound {
		errCode = codes.NotFound
	}
	return grpc.Errorf(errCode, fmt.Sprintf(message, args...))
}

func ConvertDeploymentTags(from map[string]map[string]string) map[string]*protobuf.DeploymentProcessTags {
	to := make(map[string]*protobuf.DeploymentProcessTags, len(from))
	for k, v := range from {
		to[k] = &protobuf.DeploymentProcessTags{Tags: v}
	}
	return to
}

func ConvertDeploymentProcesses(from map[string]int) map[string]int32 {
	to := make(map[string]int32, len(from))
	for k, v := range from {
		to[k] = int32(v)
	}
	return to
}

func ConvertDeploymentStatus(from string) protobuf.DeploymentStatus {
	switch from {
	case "pending":
		return protobuf.DeploymentStatus_PENDING
	case "failed":
		return protobuf.DeploymentStatus_FAILED
	case "running":
		return protobuf.DeploymentStatus_RUNNING
	case "complete":
		return protobuf.DeploymentStatus_COMPLETE
	}
	return protobuf.DeploymentStatus_PENDING
}

func ConvertDeployment(from *ct.Deployment) *protobuf.Deployment {
	return &protobuf.Deployment{
		Name:          fmt.Sprintf("apps/%s/deployments/%s", from.AppID, from.ID),
		OldRelease:    fmt.Sprintf("apps/%s/releases/%s", from.AppID, from.OldReleaseID),
		NewRelease:    fmt.Sprintf("apps/%s/releases/%s", from.AppID, from.NewReleaseID),
		Strategy:      from.Strategy,
		Status:        ConvertDeploymentStatus(from.Status),
		Processes:     ConvertDeploymentProcesses(from.Processes),
		Tags:          ConvertDeploymentTags(from.Tags),
		DeployTimeout: from.DeployTimeout,
		CreateTime:    TimestampProto(from.CreatedAt),
		EndTime:       TimestampProto(from.FinishedAt),
	}
}

func ConvertDeploymentEventJobState(from ct.JobState) protobuf.DeploymentEvent_JobState {
	switch from {
	case "pending":
		return protobuf.DeploymentEvent_PENDING
	case "blocked":
		return protobuf.DeploymentEvent_BLOCKED
	case "starting":
		return protobuf.DeploymentEvent_STARTING
	case "up":
		return protobuf.DeploymentEvent_UP
	case "stopping":
		return protobuf.DeploymentEvent_STOPPING
	case "down":
		return protobuf.DeploymentEvent_DOWN
	case "crashed":
		return protobuf.DeploymentEvent_CRASHED
	case "failed":
		return protobuf.DeploymentEvent_FAILED
	}
	return protobuf.DeploymentEvent_PENDING
}

func ConvertEventTypeSlice(in []string) []ct.EventType {
	out := make([]ct.EventType, len(in))
	for i, t := range in {
		out[i] = ct.EventType(t)
	}
	return out
}

func BackConvertApp(a *protobuf.App) *ct.App {
	return &ct.App{
		ID:            ParseIDFromName(a.Name, "apps"),
		Name:          a.DisplayName,
		Meta:          a.Labels,
		Strategy:      a.Strategy,
		ReleaseID:     ParseIDFromName(a.Release, "releases"),
		DeployTimeout: a.DeployTimeout,
		CreatedAt:     timestampFromProto(a.CreateTime),
		UpdatedAt:     timestampFromProto(a.UpdateTime),
	}
}

func BackConvertPorts(from []*protobuf.Port) []ct.Port {
	to := make([]ct.Port, len(from))
	for i, p := range from {
		to[i] = ct.Port{
			Port:    int(p.Port),
			Proto:   p.Proto,
			Service: BackConvertService(p.Service),
		}
	}
	return to
}

func BackConvertService(from *protobuf.HostService) *host.Service {
	// TODO(jvatic)
	return &host.Service{}
}

func BackConvertVolumes(from []*protobuf.VolumeReq) []ct.VolumeReq {
	// TODO(jvatic)
	return []ct.VolumeReq{}
}

func BackConvertResources(from map[string]*protobuf.HostResourceSpec) resource.Resources {
	// TODO(jvatic)
	return resource.Resources{}
}

func BackConvertMounts(from []*protobuf.HostMount) []host.Mount {
	// TODO(jvatic)
	return []host.Mount{}
}

func BackConvertAllowedDevices(from []*protobuf.LibContainerDevice) []*configs.Device {
	// TODO(jvatic)
	return []*configs.Device{}
}

func BackConvertProcesses(from map[string]*protobuf.ProcessType) map[string]ct.ProcessType {
	to := make(map[string]ct.ProcessType, len(from))
	for k, t := range from {
		to[k] = ct.ProcessType{
			Args:              t.Args,
			Env:               t.Env,
			Ports:             BackConvertPorts(t.Ports),
			Volumes:           BackConvertVolumes(t.Volumes),
			Omni:              t.Omni,
			HostNetwork:       t.HostNetwork,
			HostPIDNamespace:  t.HostPidNamespace,
			Service:           t.Service,
			Resurrect:         t.Resurrect,
			Resources:         BackConvertResources(t.Resources),
			Mounts:            BackConvertMounts(t.Mounts),
			LinuxCapabilities: t.LinuxCapabilities,
			AllowedDevices:    BackConvertAllowedDevices(t.AllowedDevices),
			WriteableCgroups:  t.WriteableCgroups,
		}
	}
	return to
}
