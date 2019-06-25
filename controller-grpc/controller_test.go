package main

import (
	"io"
	"net"
	"net/http"
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
	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/status"
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
			Host:     "/var/run/postgresql",
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

func (s *S) updateTestApp(c *C, app *protobuf.App) *protobuf.App {
	ctx, _ := context.WithTimeout(context.Background(), 10*time.Second)
	app, err := s.grpc.UpdateApp(ctx, &protobuf.UpdateAppRequest{App: app})
	c.Assert(err, IsNil)
	return app
}

func (s *S) createTestRelease(c *C, parentName string, release *protobuf.Release) *protobuf.Release {
	ctRelease := utils.BackConvertRelease(release)
	ctRelease.AppID = utils.ParseIDFromName(parentName, "apps")
	err := s.conf.releaseRepo.Add(ctRelease)
	c.Assert(err, IsNil)
	return utils.ConvertRelease(ctRelease)
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
	testApp1 := s.createTestApp(c, &protobuf.App{DisplayName: "stream-test-1-1"})
	testApp2 := s.createTestApp(c, &protobuf.App{DisplayName: "stream-test-1-2", Labels: map[string]string{"test.labels-filter": "include"}})
	testApp3 := s.createTestApp(c, &protobuf.App{DisplayName: "stream-test-1-3", Labels: map[string]string{"test.labels-filter": "exclude"}})

	isErrCanceled := func(err error) bool {
		if s, ok := status.FromError(err); ok {
			if s.Code() == codes.Canceled {
				return true
			}
		}
		return false
	}

	isErrDeadlineExceeded := func(err error) bool {
		if s, ok := status.FromError(err); ok {
			if s.Code() == codes.DeadlineExceeded {
				return true
			}
		}
		return false
	}

	unaryReceiveApps := func(req *protobuf.StreamAppsRequest) (res *protobuf.StreamAppsResponse, receivedEOF bool) {
		ctx, ctxCancel := context.WithTimeout(context.Background(), 200*time.Millisecond)
		defer func() {
			if !receivedEOF {
				ctxCancel()
			}
		}()
		stream, err := s.grpc.StreamApps(ctx, req)
		c.Assert(err, IsNil)
		for i := 0; i < 2; i++ {
			r, err := stream.Recv()
			if err == io.EOF {
				receivedEOF = true
				return
			}
			if isErrCanceled(err) {
				return
			}
			c.Assert(err, IsNil)
			res = r
		}
		return
	}

	streamAppsWithCancel := func(req *protobuf.StreamAppsRequest) (protobuf.Controller_StreamAppsClient, context.CancelFunc) {
		ctx, cancel := context.WithTimeout(context.Background(), 200*time.Millisecond)
		stream, err := s.grpc.StreamApps(ctx, req)
		c.Assert(err, IsNil)
		return stream, cancel
	}

	receiveAppsStream := func(stream protobuf.Controller_StreamAppsClient) *protobuf.StreamAppsResponse {
		res, err := stream.Recv()
		if err == io.EOF || isErrCanceled(err) || isErrDeadlineExceeded(err) {
			return nil
		}
		c.Assert(err, IsNil)
		return res
	}

	// test fetching a single app
	res, receivedEOF := unaryReceiveApps(&protobuf.StreamAppsRequest{PageSize: 1})
	c.Assert(res, Not(IsNil))
	c.Assert(len(res.Apps), Equals, 1)
	c.Assert(res.Apps[0], DeepEquals, testApp3)
	c.Assert(receivedEOF, Equals, true)

	// test fetching a singple app by name
	res, receivedEOF = unaryReceiveApps(&protobuf.StreamAppsRequest{NameFilters: []string{testApp2.Name}})
	c.Assert(res, Not(IsNil))
	c.Assert(len(res.Apps), Equals, 1)
	c.Assert(res.Apps[0], DeepEquals, testApp2)
	c.Assert(receivedEOF, Equals, true)

	// test fetching an multiple apps by name
	res, receivedEOF = unaryReceiveApps(&protobuf.StreamAppsRequest{NameFilters: []string{testApp1.Name, testApp2.Name}})
	c.Assert(res, Not(IsNil))
	c.Assert(len(res.Apps), Equals, 2)
	c.Assert(res.Apps[0], DeepEquals, testApp2)
	c.Assert(res.Apps[1], DeepEquals, testApp1)
	c.Assert(receivedEOF, Equals, true)

	// test filtering by labels [OP_NOT_IN]
	res, receivedEOF = unaryReceiveApps(&protobuf.StreamAppsRequest{LabelFilters: []*protobuf.LabelFilter{
		&protobuf.LabelFilter{
			Expressions: []*protobuf.LabelFilter_Expression{
				&protobuf.LabelFilter_Expression{
					Key:    "test.labels-filter",
					Op:     protobuf.LabelFilter_Expression_OP_NOT_IN,
					Values: []string{"exclude"},
				},
			},
		},
	}})
	c.Assert(res, Not(IsNil))
	c.Assert(len(res.Apps), Equals, 2)
	// testApp3 has test.labels-filter: exclude
	c.Assert(res.Apps[0], DeepEquals, testApp2) // has test.labels-filter: include
	c.Assert(res.Apps[1], DeepEquals, testApp1) // has no labels
	c.Assert(receivedEOF, Equals, true)

	// test filtering by labels [OP_IN]
	res, receivedEOF = unaryReceiveApps(&protobuf.StreamAppsRequest{LabelFilters: []*protobuf.LabelFilter{
		&protobuf.LabelFilter{
			Expressions: []*protobuf.LabelFilter_Expression{
				&protobuf.LabelFilter_Expression{
					Key:    "test.labels-filter",
					Op:     protobuf.LabelFilter_Expression_OP_IN,
					Values: []string{"include"},
				},
			},
		},
	}})
	c.Assert(res, Not(IsNil))
	c.Assert(len(res.Apps), Equals, 1)
	// testApp3 has test.labels-filter: exclude
	c.Assert(res.Apps[0], DeepEquals, testApp2) // has test.labels-filter: include
	// testApp1 has no labels
	c.Assert(receivedEOF, Equals, true)

	// test filtering by labels [OP_EXISTS]
	res, receivedEOF = unaryReceiveApps(&protobuf.StreamAppsRequest{LabelFilters: []*protobuf.LabelFilter{
		&protobuf.LabelFilter{
			Expressions: []*protobuf.LabelFilter_Expression{
				&protobuf.LabelFilter_Expression{
					Key: "test.labels-filter",
					Op:  protobuf.LabelFilter_Expression_OP_EXISTS,
				},
			},
		},
	}})
	c.Assert(res, Not(IsNil))
	c.Assert(len(res.Apps), Equals, 2)
	c.Assert(res.Apps[0], DeepEquals, testApp3) // has test.labels-filter
	c.Assert(res.Apps[1], DeepEquals, testApp2) // has test.labels-filter
	// testApp1 has no labels
	c.Assert(receivedEOF, Equals, true)

	// test filtering by labels [OP_NOT_EXISTS]
	res, receivedEOF = unaryReceiveApps(&protobuf.StreamAppsRequest{LabelFilters: []*protobuf.LabelFilter{
		&protobuf.LabelFilter{
			Expressions: []*protobuf.LabelFilter_Expression{
				&protobuf.LabelFilter_Expression{
					Key: "test.labels-filter",
					Op:  protobuf.LabelFilter_Expression_OP_NOT_EXISTS,
				},
			},
		},
	}})
	c.Assert(res, Not(IsNil))
	c.Assert(len(res.Apps), Equals, 1)
	// testApp3 and testApp2 both have test.labels-filter
	c.Assert(res.Apps[0], DeepEquals, testApp1) // has no labels
	c.Assert(receivedEOF, Equals, true)

	// test streaming updates
	stream, cancel := streamAppsWithCancel(&protobuf.StreamAppsRequest{NameFilters: []string{testApp1.Name}, StreamUpdates: true})
	res = receiveAppsStream(stream)
	c.Assert(res, Not(IsNil))
	c.Assert(res.Apps[0], DeepEquals, testApp1)
	testApp4 := s.createTestApp(c, &protobuf.App{DisplayName: "stream-test-1-4"}) // through in a create to test that the we get the update and not the create
	testApp1.Labels = map[string]string{"test.one": "1"}
	updatedTestApp1 := s.updateTestApp(c, testApp1)
	c.Assert(updatedTestApp1.Labels, DeepEquals, testApp1.Labels)
	res = receiveAppsStream(stream)
	c.Assert(res, Not(IsNil))
	c.Assert(len(res.Apps), Equals, 1)
	c.Assert(res.Apps[0], DeepEquals, updatedTestApp1)
	cancel()

	// test streaming updates without filters
	stream, cancel = streamAppsWithCancel(&protobuf.StreamAppsRequest{StreamUpdates: true})
	receiveAppsStream(stream)                                                     // initial page
	testApp5 := s.createTestApp(c, &protobuf.App{DisplayName: "stream-test-1-5"}) // through in a create to test that the we get the update and not the create
	testApp1.Labels = map[string]string{"test.two": "2"}
	updatedTestApp1 = s.updateTestApp(c, testApp1)
	c.Assert(updatedTestApp1.Labels, DeepEquals, testApp1.Labels)
	res = receiveAppsStream(stream)
	c.Assert(res, Not(IsNil))
	c.Assert(len(res.Apps), Equals, 1)
	c.Assert(res.Apps[0], DeepEquals, updatedTestApp1)
	cancel()

	// test streaming creates
	stream, cancel = streamAppsWithCancel(&protobuf.StreamAppsRequest{StreamCreates: true})
	receiveAppsStream(stream) // initial page
	testApp1.Labels = map[string]string{"test.three": "3"}
	updatedTestApp1 = s.updateTestApp(c, testApp1) // through in a update to test that we get the create and not the update
	testApp6 := s.createTestApp(c, &protobuf.App{DisplayName: "stream-test-1-6"})
	res = receiveAppsStream(stream)
	c.Assert(res, Not(IsNil))
	c.Assert(len(res.Apps), Equals, 1)
	c.Assert(res.Apps[0], DeepEquals, testApp6)
	cancel()

	// test streaming creates that don't match the filters
	stream, cancel = streamAppsWithCancel(&protobuf.StreamAppsRequest{NameFilters: []string{testApp1.Name}, StreamCreates: true})
	receiveAppsStream(stream) // initial page
	testApp1.Labels = map[string]string{"test.four": "4"}
	updatedTestApp1 = s.updateTestApp(c, testApp1) // through in a update to test that we get the create and not the update
	testApp7 := s.createTestApp(c, &protobuf.App{DisplayName: "stream-test-1-7"})
	res = receiveAppsStream(stream)
	c.Assert(res, IsNil)
	cancel()

	// test unary pagination
	res, receivedEOF = unaryReceiveApps(&protobuf.StreamAppsRequest{PageSize: 1})
	c.Assert(res, Not(IsNil))
	c.Assert(len(res.Apps), Equals, 1)
	c.Assert(res.Apps[0].DisplayName, DeepEquals, testApp7.DisplayName)
	c.Assert(receivedEOF, Equals, true)
	c.Assert(res.NextPageToken, Not(Equals), "")
	c.Assert(res.PageComplete, Equals, true)
	for i, testApp := range []*protobuf.App{testApp6, testApp5, testApp4, testApp3} {
		comment := Commentf("iteraction %d", i)
		res, receivedEOF = unaryReceiveApps(&protobuf.StreamAppsRequest{PageSize: 1, PageToken: res.NextPageToken})
		c.Assert(res, Not(IsNil), comment)
		c.Assert(len(res.Apps), Equals, 1, comment)
		c.Assert(res.Apps[0].DisplayName, DeepEquals, testApp.DisplayName, comment)
		c.Assert(receivedEOF, Equals, true, comment)
		c.Assert(res.NextPageToken, Not(Equals), "", comment)
		c.Assert(res.PageComplete, Equals, true, comment)
	}
	res, receivedEOF = unaryReceiveApps(&protobuf.StreamAppsRequest{PageSize: 2, PageToken: res.NextPageToken})
	c.Assert(res, Not(IsNil))
	c.Assert(len(res.Apps), Equals, 2)
	c.Assert(res.Apps[0], DeepEquals, testApp2)
	c.Assert(res.Apps[1].DisplayName, DeepEquals, testApp1.DisplayName)
	c.Assert(receivedEOF, Equals, true)
	c.Assert(res.NextPageToken, Equals, "")
	c.Assert(res.PageComplete, Equals, true)
}

func (s *S) TestStreamReleases(c *C) {
	testApp1 := s.createTestApp(c, &protobuf.App{DisplayName: "stream-test-2-1"})
	testRelease1 := s.createTestRelease(c, testApp1.Name, &protobuf.Release{Env: map[string]string{"ONE": "1"}})

	ctx, ctxCancel := context.WithCancel(context.Background())
	stream, err := s.grpc.StreamReleases(ctx, &protobuf.StreamReleasesRequest{PageSize: 1})
	c.Assert(err, IsNil)

	var releases []*protobuf.Release
	for {
		res, err := stream.Recv()
		if err == io.EOF {
			break
		}
		c.Assert(err, IsNil)
		releases = res.Releases
		ctxCancel()
		break
	}

	c.Assert(len(releases), Equals, 1)
	r := releases[0]
	c.Assert(strings.HasPrefix(r.Name, testApp1.Name), Equals, true)
	c.Assert(r.Artifacts, DeepEquals, testRelease1.Artifacts)
	c.Assert(r.Env, DeepEquals, testRelease1.Env)
	c.Assert(r.Labels, DeepEquals, testRelease1.Labels)
	c.Assert(r.Processes, DeepEquals, testRelease1.Processes)
	c.Assert(r.CreateTime, DeepEquals, testRelease1.CreateTime)
}
