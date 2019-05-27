package data

import (
	"encoding/json"

	ct "github.com/flynn/flynn/controller/types"
	"github.com/flynn/flynn/pkg/postgres"
	"github.com/flynn/flynn/pkg/random"
	"github.com/flynn/que-go"
	"github.com/jackc/pgx"
)

type DeploymentRepo struct {
	db *postgres.DB
	q  *que.Client
}

func NewDeploymentRepo(db *postgres.DB) *DeploymentRepo {
	q := que.NewClient(db.ConnPool)
	return &DeploymentRepo{db: db, q: q}
}

func (r *DeploymentRepo) Add(data interface{}) (*ct.Deployment, error) {
	d := data.(*ct.Deployment)
	if d.ID == "" {
		d.ID = random.UUID()
	}
	var oldReleaseID *string
	if d.OldReleaseID != "" {
		oldReleaseID = &d.OldReleaseID
	}
	tx, err := r.db.Begin()
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

	tx, err = r.db.Begin()
	if err != nil {
		return nil, err
	}
	if err = createDeploymentEvent(tx.Exec, d, "pending"); err != nil {
		tx.Rollback()
		return nil, err
	}
	d.Status = "pending"

	job := &que.Job{Type: "deployment", Args: args}
	if err := r.q.EnqueueInTx(job, tx.Tx); err != nil {
		tx.Rollback()
		return nil, err
	}
	if err = tx.Commit(); err != nil {
		return nil, err
	}
	return d, err
}

func (r *DeploymentRepo) Get(id string) (*ct.Deployment, error) {
	row := r.db.QueryRow("deployment_select", id)
	return scanDeployment(row)
}

func (r *DeploymentRepo) List(appID string) ([]*ct.Deployment, error) {
	rows, err := r.db.Query("deployment_list", appID)
	if err != nil {
		return nil, err
	}
	var deployments []*ct.Deployment
	for rows.Next() {
		deployment, err := scanDeployment(rows)
		if err != nil {
			rows.Close()
			return nil, err
		}
		deployments = append(deployments, deployment)
	}
	return deployments, rows.Err()
}

func scanDeployment(s postgres.Scanner) (*ct.Deployment, error) {
	d := &ct.Deployment{}
	var oldReleaseID *string
	var status *string
	err := s.Scan(&d.ID, &d.AppID, &oldReleaseID, &d.NewReleaseID, &d.Strategy, &status, &d.Processes, &d.Tags, &d.DeployTimeout, &d.CreatedAt, &d.FinishedAt)
	if err == pgx.ErrNoRows {
		err = ErrNotFound
	}
	if oldReleaseID != nil {
		d.OldReleaseID = *oldReleaseID
	}
	if status != nil {
		d.Status = *status
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
	if err := CreateEvent(dbExec, &ct.Event{
		AppID:      d.AppID,
		ObjectID:   d.ID,
		ObjectType: ct.EventTypeDeployment,
	}, e); err != nil {
		return err
	}
	return nil
}
