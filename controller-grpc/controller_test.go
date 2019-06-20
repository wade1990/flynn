package main

import (
	"io"
	"net"
	"net/http"
	"os"
	"strings"
	"testing"
	"time"

	"github.com/flynn/flynn/controller-grpc/protobuf"
	"github.com/flynn/flynn/controller-grpc/utils"
	"github.com/flynn/flynn/controller/data"
	"github.com/flynn/flynn/controller/schema"
	"github.com/flynn/flynn/pkg/postgres"
	"github.com/flynn/flynn/pkg/testutils/postgres"
	. "github.com/flynn/go-check"
	que "github.com/flynn/que-go"
	"github.com/jackc/pgx"
	"golang.org/x/net/context"
	"google.golang.org/grpc"
	"google.golang.org/grpc/test/bufconn"
)

const bufSize = 1024 * 1024

// Hook gocheck up to the "go test" runner
func Test(t *testing.T) { TestingT(t) }

type S struct {
	srv         *grpc.Server
	conf        *Config
	grpc        protobuf.ControllerClient
	http        *http.Client
	tearDownFns []func()
}

var _ = Suite(&S{})

var authKey = "test"

func setupTestDB(c *C, dbname string) *postgres.DB {
	if err := pgtestutils.SetupPostgres(dbname); err != nil {
		c.Fatal(err)
	}
	pgxpool, err := pgx.NewConnPool(pgx.ConnPoolConfig{
		ConnConfig: pgx.ConnConfig{
			Host:     os.Getenv("PGHOST"),
			Database: dbname,
		},
	})
	if err != nil {
		c.Fatal(err)
	}
	return postgres.New(pgxpool, nil)
}

func (s *S) SetUpSuite(c *C) {
	dbname := "controllertest"
	db := setupTestDB(c, dbname)
	if err := data.MigrateDB(db); err != nil {
		c.Fatal(err)
	}

	// reconnect with que statements prepared now that schema is migrated
	pgxpool, err := pgx.NewConnPool(pgx.ConnPoolConfig{
		ConnConfig: pgx.ConnConfig{
			Host:     "/var/run/postgresql",
			Database: dbname,
		},
		AfterConnect: schema.PrepareStatements,
	})
	if err != nil {
		c.Fatal(err)
	}
	db = postgres.New(pgxpool, nil)
	q := que.NewClient(db.ConnPool)
	conf := configureRepos(&Config{
		DB: db,
		q:  q,
	})
	lis := bufconn.Listen(bufSize)
	s.tearDownFns = append(s.tearDownFns, func() {
		lis.Close()
	})
	s.srv = NewServer(conf)
	go runServer(s.srv, lis)
	s.conf = conf

	// Set up a connection to the server
	conn, err := grpc.Dial(lis.Addr().String(), grpc.WithDialer(func(string, time.Duration) (net.Conn, error) {
		return lis.Dial()
	}), grpc.WithInsecure())
	if err != nil {
		c.Fatalf("did not connect to server: %v", err)
	}
	s.tearDownFns = append(s.tearDownFns, func() {
		conn.Close()
	})
	s.grpc = protobuf.NewControllerClient(conn)

	// Setup up a regular http client
	t := &http.Transport{
		Proxy: http.ProxyFromEnvironment,
		DialContext: func(context.Context, string, string) (net.Conn, error) {
			return lis.Dial()
		},
		MaxIdleConns:          100,
		IdleConnTimeout:       90 * time.Second,
		TLSHandshakeTimeout:   10 * time.Second,
		ExpectContinueTimeout: 1 * time.Second,
	}
	s.http = &http.Client{
		Transport: t,
		CheckRedirect: func(req *http.Request, via []*http.Request) error {
			return http.ErrUseLastResponse
		},
		Timeout: time.Second * 10,
	}
}

func (s *S) TearDownSuite(c *C) {
	for _, fn := range s.tearDownFns {
		fn()
	}
}

func (s *S) createTestApp(c *C, app *protobuf.App) *protobuf.App {
	ctApp := utils.BackConvertApp(app)
	err := s.conf.appRepo.Add(ctApp)
	c.Assert(err, IsNil)
	return utils.ConvertApp(ctApp)
}

func (s *S) TestOptionsRequest(c *C) { // grpc-web
	req, err := http.NewRequest("OPTIONS", "http://localhost/grpc-web/fake", nil)
	c.Assert(err, IsNil)
	req.Header.Set("Origin", "http://localhost:3333")
	req.Header.Set("Access-Control-Request-Method", "POST")
	allowHeaders := []string{"Content-Type", "X-GRPC-Web"}
	req.Header.Set("Access-Control-Request-Headers", strings.Join(allowHeaders, ","))
	res, err := s.http.Do(req)
	c.Assert(err, IsNil)
	c.Assert(res.StatusCode, Equals, 200)
	c.Assert(res.Header.Get("Access-Control-Allow-Credentials"), Equals, "true")
	accessControlAllowHeaders := strings.ToLower(res.Header.Get("Access-Control-Allow-Headers"))
	for _, h := range allowHeaders {
		c.Assert(strings.Contains(accessControlAllowHeaders, strings.ToLower(h)), Equals, true)
	}
	c.Assert(res.Header.Get("Access-Control-Allow-Origin"), Equals, req.Header.Get("Origin"))
	c.Assert(res.Header.Get("Access-Control-Allow-Methods"), Matches, ".*POST.*")
}

func (s *S) TestStreamApps(c *C) {
	testApp1 := s.createTestApp(c, &protobuf.App{DisplayName: "stream-test-1"})

	ctx, ctxCancel := context.WithCancel(context.Background())
	stream, err := s.grpc.StreamApps(ctx, &protobuf.StreamAppsRequest{PageSize: 1})
	c.Assert(err, IsNil)

	var apps []*protobuf.App
	for {
		res, err := stream.Recv()
		if err == io.EOF {
			break
		}
		c.Assert(err, IsNil)
		apps = res.Apps
		ctxCancel()
		break
	}
	c.Assert(len(apps), Equals, 1)
	c.Assert(apps[0], DeepEquals, testApp1)
}
