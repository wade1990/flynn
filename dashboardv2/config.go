package main

import (
	"encoding/json"
	"fmt"
	"log"
	"os"
)

type Config struct {
	Addr             string
	ControllerDomain string
	InterfaceURL     string
	PublicConfig     map[string]string
	PublicConfigJSON []byte
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

	conf.PublicConfig = map[string]string{
		"CONTROLLER_HOST": fmt.Sprintf("https://%s", conf.ControllerDomain),
		"PUBLIC_URL":      conf.InterfaceURL,
	}

	var err error
	conf.PublicConfigJSON, err = json.Marshal(conf.PublicConfig)
	if err != nil {
		log.Fatalf("Error encoding PublicConfigJSON: %v", err)
	}

	return conf
}
