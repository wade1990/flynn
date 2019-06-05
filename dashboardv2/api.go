package main

import (
	"bytes"
	"fmt"
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
	"github.com/julienschmidt/httprouter"
	"golang.org/x/net/context"
)

type LoginInfo struct {
	Token string `json:"token"`
}

func NewDashboardHandler(conf *Config) http.Handler {
	api := &API{
		conf:       conf,
		assetCache: make(map[string][]byte),
	}

	router := httprouter.New()
	router2 := httprouter.New()

	prefixPath := func(p string) string {
		return p // TODO(jvatic): handle path prefix?
	}

	router.HandlerFunc("GET", status.Path, status.HealthyHandler.ServeHTTP)

	router.GET(prefixPath("/robots.txt"), api.WrapHandler(api.ServeRobotsTxt))

	router.GET(prefixPath("/"), api.WrapHandler(api.ServeIndex))
	router.GET(prefixPath("/apps/*path"), api.WrapHandler(api.ServeIndex))

	router.NotFound = router2.ServeHTTP
	router2.GET(prefixPath("/*path"), api.WrapHandler(api.ServeAsset))

	return httphelper.ContextInjector("dashboard",
		httphelper.NewRequestLogger(
			api.ContentSecurityHandler(api.CorsHandler(router))))
}

type API struct {
	conf       *Config
	assetCache map[string][]byte
}

func (api *API) WrapHandler(handler httphelper.HandlerFunc) httprouter.Handle {
	return func(w http.ResponseWriter, req *http.Request, params httprouter.Params) {
		ctx := w.(*httphelper.ResponseWriter).Context()
		ctx = ctxhelper.NewContextParams(ctx, params)
		handler.ServeHTTP(ctx, w, req)
		gctx.Clear(req)
	}
}

func (api *API) CorsHandler(main http.Handler) http.Handler {
	allowedOrigins := []string{api.conf.InterfaceURL}
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
		w.Header().Add("Content-Security-Policy", fmt.Sprintf("default-src 'none'; connect-src 'self' %s; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; font-src 'self' data:; img-src 'self'; manifest-src 'self'", api.conf.ControllerDomain))
		w.Header().Add("X-Content-Type-Options", "nosniff")
		w.Header().Add("X-Frame-Options", "DENY")
		w.Header().Add("X-XSS-Protection", "1; mode=block")
		main.ServeHTTP(w, req)
	})
}

func (api *API) ServeRobotsTxt(ctx context.Context, w http.ResponseWriter, req *http.Request) {
	w.Write([]byte("User-agent: *\nDisallow: /\n"))
}

// interpolateConfig replaces %VAR_NAME% with the value of
// PublicConfig[VAR_NAME] or nothing
func (api API) interpolateConfig(data []byte) []byte {
	buf := make([]byte, 0, len(data))

	var inVar bool
	var varName []byte
	for _, b := range data {
		if string(b) == "%" {
			if inVar {
				inVar = false

				if string(varName) == "PUBLIC_CONFIG_JSON" {
					buf = append(buf, api.conf.PublicConfigJSON...)
				} else if v, ok := api.conf.PublicConfig[string(varName)]; ok {
					buf = append(buf, []byte(v)...)
				}

				varName = nil
			} else {
				inVar = true
			}
			continue
		}

		if inVar {
			varName = append(varName, b)
		} else {
			buf = append(buf, b)
		}
	}

	return buf
}

func (api *API) ServeStatic(ctx context.Context, w http.ResponseWriter, req *http.Request, path string) {
	log, _ := ctxhelper.LoggerFromContext(ctx)
	t := time.Time{}
	data, err := Asset(path)
	if err != nil {
		log.Error(err.Error())
		w.WriteHeader(404)
		return
	}
	if fi, err := AssetInfo(path); err != nil {
		t = fi.ModTime()
	}
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

		if d, ok := api.assetCache[path]; ok {
			data = d
		} else {
			data = api.interpolateConfig(data)
			api.assetCache[path] = data
		}
	}

	http.ServeContent(w, req, path, t, bytes.NewReader(data))
}

func (api *API) ServeIndex(ctx context.Context, w http.ResponseWriter, req *http.Request) {
	api.ServeStatic(ctx, w, req, filepath.Join("build", "index.html"))
}

func (api *API) ServeAsset(ctx context.Context, w http.ResponseWriter, req *http.Request) {
	params, _ := ctxhelper.ParamsFromContext(ctx)
	path := params.ByName("path")
	api.ServeStatic(ctx, w, req, filepath.Join("build", path))
}
