package main

import (
	"log"
	"os"
)

type Config struct {
	Addr             string
	ControllerDomain string
	InterfaceURL     string
}

func MustConfig() *Config {
	conf := &Config{}
	port := os.Getenv("PORT")
	if port == "" {
		port = "5200"
	}
	conf.Addr = ":" + port

	conf.ControllerDomain = os.Getenv("CONTROLLER_DOMAIN")
	if conf.ControllerDomain == "" {
		log.Fatal("CONTROLLER_DOMAIN is required!")
	}

	conf.InterfaceURL = os.Getenv("INTERFACE_URL")
	if conf.InterfaceURL == "" {
		log.Fatal("INTERFACE_URL is required!")
	}

	return conf
}
