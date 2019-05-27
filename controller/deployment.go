package main

import (
	"fmt"
	"net/http"
	"time"

	"github.com/flynn/flynn/controller/schema"
	ct "github.com/flynn/flynn/controller/types"
	"github.com/flynn/flynn/pkg/ctxhelper"
	"github.com/flynn/flynn/pkg/httphelper"
	"github.com/flynn/flynn/pkg/postgres"
	"golang.org/x/net/context"
)

func (c *controllerAPI) GetDeployment(ctx context.Context, w http.ResponseWriter, req *http.Request) {
	params, _ := ctxhelper.ParamsFromContext(ctx)
	deployment, err := c.deploymentRepo.Get(params.ByName("deployment_id"))
	if err != nil {
		respondWithError(w, err)
		return
	}
	httphelper.JSON(w, 200, deployment)
}

func (c *controllerAPI) CreateDeployment(ctx context.Context, w http.ResponseWriter, req *http.Request) {
	var rid releaseID
	if err := httphelper.DecodeJSON(req, &rid); err != nil {
		respondWithError(w, err)
		return
	}

	rel, err := c.releaseRepo.Get(rid.ID)
	if err != nil {
		if err == ErrNotFound {
			err = ct.ValidationError{
				Message: fmt.Sprintf("could not find release with ID %s", rid.ID),
			}
		}
		respondWithError(w, err)
		return
	}
	release := rel.(*ct.Release)
	app := c.getApp(ctx)

	// TODO: wrap all of this in a transaction
	oldRelease, err := c.appRepo.GetRelease(app.ID)
	if err == ErrNotFound {
		oldRelease = &ct.Release{}
	} else if err != nil {
		respondWithError(w, err)
		return
	}
	oldFormation, err := c.formationRepo.Get(app.ID, oldRelease.ID)
	if err == ErrNotFound {
		oldFormation = &ct.Formation{}
	} else if err != nil {
		respondWithError(w, err)
		return
	}
	procCount := 0
	for _, i := range oldFormation.Processes {
		procCount += i
	}

	deployment := &ct.Deployment{
		AppID:         app.ID,
		NewReleaseID:  release.ID,
		Strategy:      app.Strategy,
		OldReleaseID:  oldRelease.ID,
		Processes:     oldFormation.Processes,
		Tags:          oldFormation.Tags,
		DeployTimeout: app.DeployTimeout,
	}

	if err := schema.Validate(deployment); err != nil {
		respondWithError(w, err)
		return
	}
	if procCount == 0 {
		// immediately set app release
		if err := c.appRepo.SetRelease(app, release.ID); err != nil {
			respondWithError(w, err)
			return
		}
		now := time.Now()
		deployment.FinishedAt = &now
	}

	d, err := c.deploymentRepo.Add(deployment)
	if err != nil {
		if postgres.IsUniquenessError(err, "isolate_deploys") {
			httphelper.ValidationError(w, "", "Cannot create deploy, there is already one in progress for this app.")
			return
		}
		respondWithError(w, err)
		return
	}

	httphelper.JSON(w, 200, d)
}

func (c *controllerAPI) ListDeployments(ctx context.Context, w http.ResponseWriter, req *http.Request) {
	app := c.getApp(ctx)
	list, err := c.deploymentRepo.List(app.ID)
	if err != nil {
		respondWithError(w, err)
		return
	}
	httphelper.JSON(w, 200, list)
}
