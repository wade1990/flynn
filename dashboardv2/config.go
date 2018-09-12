package main

import (
	"fmt"
	"log"
	"os"
	"strings"

	"github.com/gorilla/sessions"
)

type Config struct {
	Addr                 string
	DefaultRouteDomain   string
	ControllerDomain     string
	ControllerKey        string
	StatusDomain         string
	StatusKey            string
	URL                  string
	InterfaceURL         string
	CookiePath           string
	SecureCookies        bool
	LoginToken           string
	SessionStore         *sessions.CookieStore
	InstallCert          bool
	DefaultDeployTimeout int
}

func LoadConfigFromEnv() *Config {
	conf := &Config{}
	port := os.Getenv("PORT")
	if port == "" {
		port = "5200"
	}
	conf.Addr = ":" + port

	conf.DefaultRouteDomain = os.Getenv("DEFAULT_ROUTE_DOMAIN")
	if conf.DefaultRouteDomain == "" {
		log.Fatal("DEFAULT_ROUTE_DOMAIN is required!")
	}

	conf.ControllerDomain = os.Getenv("CONTROLLER_DOMAIN")
	if conf.ControllerDomain == "" {
		log.Fatal("CONTROLLER_DOMAIN is required!")
	}

	conf.ControllerKey = os.Getenv("CONTROLLER_KEY")
	if conf.ControllerKey == "" {
		log.Fatal("CONTROLLER_KEY is required!")
	}

	conf.StatusDomain = fmt.Sprintf("status.%s", conf.DefaultRouteDomain)
	conf.StatusKey = os.Getenv("STATUS_KEY")

	conf.URL = os.Getenv("URL")
	if conf.URL == "" {
		log.Fatal("URL is required!")
	}
	conf.InterfaceURL = conf.URL

	sessionSecret := os.Getenv("SESSION_SECRET")
	if sessionSecret == "" {
		log.Fatal("SESSION_SECRET is required!")
	}
	conf.SessionStore = sessions.NewCookieStore([]byte(sessionSecret))

	conf.SecureCookies = os.Getenv("SECURE_COOKIES") != ""

	conf.LoginToken = os.Getenv("LOGIN_TOKEN")
	if conf.LoginToken == "" {
		log.Fatal("LOGIN_TOKEN is required")
	}

	conf.InstallCert = strings.HasPrefix(conf.URL, "https://")

	return conf
}
