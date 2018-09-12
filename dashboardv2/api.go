package main

import (
	"bytes"
	"crypto/subtle"
	"encoding/json"
	"fmt"
	"io"
	"mime"
	"net/http"
	"path/filepath"
	"strings"
	"time"

	"github.com/flynn/flynn/pkg/cors"
	"github.com/flynn/flynn/pkg/ctxhelper"
	"github.com/flynn/flynn/pkg/httphelper"
	"github.com/flynn/flynn/pkg/status"
	gctx "github.com/gorilla/context"
	"github.com/gorilla/sessions"
	"github.com/julienschmidt/httprouter"
	"golang.org/x/net/context"
)

type LoginInfo struct {
	Token string `json:"token"`
}

func AssetReader(path string) (io.ReadSeeker, time.Time, error) {
	t := time.Time{}
	data, err := Asset(path)
	if err != nil {
		return nil, t, err
	}
	if fi, err := AssetInfo(path); err != nil {
		t = fi.ModTime()
	}
	return bytes.NewReader(data), t, nil
}

func APIHandler(conf *Config) http.Handler {
	api := &API{
		conf: conf,
	}

	router := httprouter.New()
	router2 := httprouter.New()

	prefixPath := func(p string) string {
		return p // TODO(jvatic): handle path prefix?
	}

	router.HandlerFunc("GET", status.Path, status.HealthyHandler.ServeHTTP)

	router.GET(prefixPath("/robots.txt"), api.WrapHandler(api.ServeRobotsTxt))

	router.POST(prefixPath("/user/sessions"), api.WrapHandler(api.Login))
	router.DELETE(prefixPath("/user/session"), api.WrapHandler(api.Logout))

	router.NotFound = router2.ServeHTTP
	router2.GET(prefixPath("/*path"), api.WrapHandler(api.ServeAsset))

	return httphelper.ContextInjector("dashboard",
		httphelper.NewRequestLogger(
			api.ContentSecurityHandler(api.CorsHandler(router))))
}

type API struct {
	conf               *Config
	dashboardJS        bytes.Buffer
	dashboardJSModTime time.Time
}

const ctxSessionKey = "session"

func (api *API) WrapHandler(handler httphelper.HandlerFunc) httprouter.Handle {
	return func(w http.ResponseWriter, req *http.Request, params httprouter.Params) {
		ctx := w.(*httphelper.ResponseWriter).Context()
		log, _ := ctxhelper.LoggerFromContext(ctx)
		ctx = ctxhelper.NewContextParams(ctx, params)
		s, err := api.conf.SessionStore.Get(req, "session")
		if err != nil {
			log.Error(err.Error())
		}
		ctx = context.WithValue(ctx, ctxSessionKey, s)
		handler.ServeHTTP(ctx, w, req)
		gctx.Clear(req)
	}
}

func (api *API) SessionFromContext(ctx context.Context) *sessions.Session {
	return ctx.Value(ctxSessionKey).(*sessions.Session)
}

func (api *API) IsAuthenticated(ctx context.Context) bool {
	return api.SessionFromContext(ctx).Values["auth"] == true
}

func (api *API) SetAuthenticated(ctx context.Context, w http.ResponseWriter, req *http.Request) {
	s := api.SessionFromContext(ctx)
	s.Values["auth"] = true
	s.Save(req, w)
}

func (api *API) UnsetAuthenticated(ctx context.Context, w http.ResponseWriter, req *http.Request) {
	s := api.SessionFromContext(ctx)
	delete(s.Values, "auth")
	s.Save(req, w)
}

func (api *API) CorsHandler(main http.Handler) http.Handler {
	httpInterfaceURL := api.conf.InterfaceURL
	if strings.HasPrefix(api.conf.InterfaceURL, "https") {
		httpInterfaceURL = "http" + strings.TrimPrefix(api.conf.InterfaceURL, "https")
	}
	allowedOrigins := []string{api.conf.InterfaceURL, httpInterfaceURL}
	return (&cors.Options{
		ShouldAllowOrigin: func(origin string, req *http.Request) bool {
			for _, o := range allowedOrigins {
				if origin == o {
					return true
				}
			}
			return strings.HasSuffix(req.URL.Path, "/ping")
		},
		AllowMethods:     []string{"GET", "POST", "PUT", "PATCH", "DELETE", "HEAD"},
		AllowHeaders:     []string{"Authorization", "Accept", "Content-Type", "If-Match", "If-None-Match"},
		ExposeHeaders:    []string{"ETag"},
		AllowCredentials: true,
		MaxAge:           time.Hour,
	}).Handler(http.HandlerFunc(func(w http.ResponseWriter, req *http.Request) {
		if strings.HasSuffix(req.URL.Path, "/ping") {
			w.WriteHeader(200)
			return
		}
		main.ServeHTTP(w, req)
	}))
}

func (api *API) ContentSecurityHandler(main http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, req *http.Request) {
		w.Header().Add("Content-Security-Policy", fmt.Sprintf("default-src 'none'; connect-src 'self' %s %s; script-src 'self'; style-src 'self' 'unsafe-inline'; font-src 'self' data:; img-src 'self'", api.conf.ControllerDomain, api.conf.StatusDomain))
		w.Header().Add("X-Content-Type-Options", "nosniff")
		w.Header().Add("X-Frame-Options", "DENY")
		w.Header().Add("X-XSS-Protection", "1; mode=block")
		main.ServeHTTP(w, req)
	})
}

func (api *API) ServeRobotsTxt(ctx context.Context, w http.ResponseWriter, req *http.Request) {
	w.Write([]byte("User-agent: *\nDisallow: /\n"))
}

func (api *API) ServeStatic(ctx context.Context, w http.ResponseWriter, req *http.Request, path string) {
	log, _ := ctxhelper.LoggerFromContext(ctx)
	data, t, err := AssetReader(path)
	if err != nil {
		log.Error(err.Error())
		w.WriteHeader(404)
		return
	}

	ext := filepath.Ext(path)
	if mimeType := mime.TypeByExtension(ext); mimeType != "" {
		w.Header().Add("Content-Type", mimeType)
	}
	if ext == ".html" {
		w.Header().Add("Cache-Control", "max-age=0")
	}

	http.ServeContent(w, req, path, t, data)
}

func (api *API) ServeAsset(ctx context.Context, w http.ResponseWriter, req *http.Request) {
	params, _ := ctxhelper.ParamsFromContext(ctx)
	path := params.ByName("path")
	api.ServeStatic(ctx, w, req, filepath.Join("build", path))
}

func (api *API) Login(ctx context.Context, w http.ResponseWriter, req *http.Request) {
	var info LoginInfo
	if strings.Contains(req.Header.Get("Content-Type"), "form-urlencoded") {
		if err := req.ParseForm(); err != nil {
			httphelper.Error(w, err)
			return
		}
		info = LoginInfo{Token: req.PostForm.Get("token")}
	} else {
		if err := json.NewDecoder(req.Body).Decode(&info); err != nil {
			httphelper.Error(w, err)
			return
		}
	}
	if len(info.Token) != len(api.conf.LoginToken) || subtle.ConstantTimeCompare([]byte(info.Token), []byte(api.conf.LoginToken)) != 1 {
		httphelper.Error(w, httphelper.JSONError{
			Code:    httphelper.UnauthorizedErrorCode,
			Message: "Invalid login token",
		})
		return
	}
	api.SetAuthenticated(ctx, w, req)
	if strings.Contains(req.Header.Get("Content-Type"), "form-urlencoded") {
		http.Redirect(w, req, api.conf.CookiePath, 302)
	} else {
		w.WriteHeader(200)
	}
}

func (api *API) Logout(ctx context.Context, w http.ResponseWriter, req *http.Request) {
	api.UnsetAuthenticated(ctx, w, req)
	w.WriteHeader(200)
}
