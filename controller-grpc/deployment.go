package main

import (
	"encoding/json"
	fmt "fmt"
	"time"

	controller "github.com/flynn/flynn/controller/client"
	ct "github.com/flynn/flynn/controller/types"
	"github.com/flynn/flynn/pkg/httphelper"
	"github.com/flynn/flynn/pkg/postgres"
	"github.com/flynn/flynn/pkg/random"
	que "github.com/flynn/que-go"
)

func (s *server) createDeploymentWithFormation(req *CreateDeploymentRequest, ds Controller_CreateDeploymentServer) (*ct.Deployment, error) {
	app, err := s.Client.GetApp(parseIDFromName(req.Parent, "apps"))
	if err != nil {
		return nil, err
	}
	release, err := s.Client.GetRelease(parseIDFromName(req.Release, "releases"))
	if err != nil {
		return nil, err
	}

	oldRelease, err := s.Client.GetAppRelease(app.ID)
	if err == controller.ErrNotFound {
		oldRelease = &ct.Release{}
	} else if err != nil {
		return nil, err
	}

	processes := parseDeploymentProcesses(req.Processes)
	tags := parseDeploymentTags(req.Tags)
	if req.UsePrevFormation {
		oldFormation, err := s.Client.GetFormation(app.ID, oldRelease.ID)
		if err == controller.ErrNotFound {
			oldFormation = &ct.Formation{}
		} else if err != nil {
			return nil, err
		}
		processes = oldFormation.Processes
		tags = oldFormation.Tags
	}

	procCount := 0
	for _, i := range processes {
		procCount += i
	}

	deployment := &ct.Deployment{
		AppID:         app.ID,
		NewReleaseID:  release.ID,
		Strategy:      app.Strategy,
		OldReleaseID:  oldRelease.ID,
		Processes:     processes,
		Tags:          tags,
		DeployTimeout: app.DeployTimeout,
	}

	if procCount == 0 {
		// immediately set app release
		if err := s.Client.SetAppRelease(app.ID, release.ID); err != nil {
			return nil, err
		}
		now := time.Now()
		deployment.FinishedAt = &now
	}

	d, err := s.addDeployment(deployment)
	if err != nil {
		if postgres.IsUniquenessError(err, "isolate_deploys") {
			return nil, httphelper.JSONError{Code: httphelper.ValidationErrorCode, Message: "Cannot create deploy, there is already one in progress for this app."}
		}
		return nil, err
	}
	return d, nil
}

func (s *server) addDeployment(d *ct.Deployment) (*ct.Deployment, error) {
	if d.ID == "" {
		d.ID = random.UUID()
	}
	var oldReleaseID *string
	if d.OldReleaseID != "" {
		oldReleaseID = &d.OldReleaseID
	}
	tx, err := s.DB.Begin()
	if err != nil {
		return nil, err
	}
	if err := tx.QueryRow("deployment_insert", d.ID, d.AppID, oldReleaseID, d.NewReleaseID, d.Strategy, d.Processes, d.Tags, d.DeployTimeout).Scan(&d.CreatedAt); err != nil {
		tx.Rollback()
		return nil, err
	}

	// fake initial deployment
	if d.FinishedAt != nil {
		if err := tx.Exec("deployment_update_finished_at", d.ID, d.FinishedAt); err != nil {
			tx.Rollback()
			return nil, err
		}
		if err = createDeploymentEvent(tx.Exec, d, "complete"); err != nil {
			tx.Rollback()
			return nil, err
		}
		d.Status = "complete"
		return d, tx.Commit()
	}
	if err := tx.Commit(); err != nil {
		return nil, err
	}

	args, err := json.Marshal(ct.DeployID{ID: d.ID})
	if err != nil {
		return nil, err
	}

	tx, err = s.DB.Begin()
	if err != nil {
		return nil, err
	}
	if err = createDeploymentEvent(tx.Exec, d, "pending"); err != nil {
		tx.Rollback()
		return nil, err
	}
	d.Status = "pending"

	job := &que.Job{Type: "deployment", Args: args}
	if err := s.q.EnqueueInTx(job, tx.Tx); err != nil {
		tx.Rollback()
		return nil, err
	}
	if err = tx.Commit(); err != nil {
		return nil, err
	}
	return d, err
}

func createDeploymentEvent(dbExec func(string, ...interface{}) error, d *ct.Deployment, status string) error {
	e := ct.DeploymentEvent{
		AppID:        d.AppID,
		DeploymentID: d.ID,
		ReleaseID:    d.NewReleaseID,
		Status:       status,
	}
	return createEvent(dbExec, &ct.Event{
		AppID:      d.AppID,
		ObjectID:   d.ID,
		ObjectType: ct.EventTypeDeployment,
	}, e)
}

func createEvent(dbExec func(string, ...interface{}) error, e *ct.Event, data interface{}) error {
	args := []interface{}{e.ObjectID, string(e.ObjectType), data}
	fields := []string{"object_id", "object_type", "data"}
	if e.AppID != "" {
		fields = append(fields, "app_id")
		args = append(args, e.AppID)
	}
	if e.UniqueID != "" {
		fields = append(fields, "unique_id")
		args = append(args, e.UniqueID)
	}
	query := "INSERT INTO events ("
	for i, n := range fields {
		if i > 0 {
			query += ","
		}
		query += n
	}
	query += ") VALUES ("
	for i := range fields {
		if i > 0 {
			query += ","
		}
		query += fmt.Sprintf("$%d", i+1)
	}
	query += ")"
	return dbExec(query, args...)
}
