//go:generate protoc -I/usr/local/include -I../controller/grpc -I${GOPATH}/src/github.com/grpc-ecosystem/grpc-gateway/third_party/googleapis --go_out=plugins=grpc:. ../controller/grpc/controller.proto
package main

import (
	fmt "fmt"
	"net/http"
	"os"
	"path"
	"strings"
	"time"

	controller "github.com/flynn/flynn/controller/client"
	ct "github.com/flynn/flynn/controller/types"
	"github.com/flynn/flynn/pkg/cors"
	"github.com/flynn/flynn/pkg/httphelper"
	"github.com/flynn/flynn/pkg/shutdown"
	"github.com/golang/protobuf/ptypes"
	durpb "github.com/golang/protobuf/ptypes/duration"
	tspb "github.com/golang/protobuf/ptypes/timestamp"
	"github.com/improbable-eng/grpc-web/go/grpcweb"
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

func parseAppID(name string) string {
	parts := strings.Split(name, "/")
	if len(parts) == 2 {
		return parts[1]
	}
	return ""
}

func convertApp(a *ct.App) *App {
	return &App{
		Name:          path.Join("apps", a.ID),
		DisplayName:   a.Name,
		Labels:        a.Meta,
		Strategy:      a.Strategy,
		Release:       path.Join("apps", a.ID, "releases", a.ReleaseID),
		DeployTimeout: a.DeployTimeout,
		CreateTime:    timestampProto(a.CreatedAt),
		UpdateTime:    timestampProto(a.UpdatedAt),
	}
}

func (s *server) ListApps(ctx context.Context, req *ListAppsRequest) (*ListAppsResponse, error) {
	ctApps, err := s.Client.AppList()
	if err != nil {
		return nil, err
	}
	apps := make([]*App, len(ctApps))
	for i, a := range ctApps {
		apps[i] = convertApp(a)
	}
	return &ListAppsResponse{
		Apps:          apps,
		NextPageToken: "", // there is no pagination
	}, nil
}

func (s *server) GetApp(ctx context.Context, req *GetAppRequest) (*App, error) {
	return convertApp(&ct.App{}), nil
}

func (s *server) StreamAppLog(*StreamAppLogRequest, Controller_StreamAppLogServer) error {
	return nil
}

func (s *server) CreateRelease(ctx context.Context, req *CreateReleaseRequest) (*Release, error) {
	return &Release{}, nil
}

func (s *server) CreateDeployment(context.Context, *CreateDeploymentRequest) (*Deployment, error) {
	return &Deployment{}, nil
}

func (s *server) StreamEvents(*StreamEventsRequest, Controller_StreamEventsServer) error {
	return nil
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
