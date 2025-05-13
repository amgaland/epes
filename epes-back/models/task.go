package models

import "time"

type Task struct {
	Model
	ProjectID       string     `json:"project_id" gorm:"type:uuid"`
	Project         Project    `json:"project" gorm:"foreignKey:ProjectID;references:ID"`
	Title           string     `json:"title" gorm:"type:varchar(200);not null"`
	Description     string     `json:"description" gorm:"type:text"`
	AssignedToID    string     `json:"assigned_to_id" gorm:"type:uuid;index"`
	AssignedTo      User       `json:"assigned_to" gorm:"foreignKey:AssignedToID;references:ID"`
	Status          string     `json:"status" gorm:"type:varchar(20);not null"`
	Deadline        *time.Time `json:"deadline" gorm:"type:date"`
	CompletedAt     *time.Time `json:"completed_at"`
	CompletionScore float64    `json:"completion_score" gorm:"check:completion_score >= 0 AND completion_score <= 100"`
}

type TaskFeedback struct {
	Model
	TaskID      string `json:"task_id" gorm:"type:uuid;index"`
	Task        Task   `json:"task" gorm:"foreignKey:TaskID;references:ID"`
	EvaluatorID string `json:"evaluator_id" gorm:"type:uuid"`
	Evaluator   User   `json:"evaluator" gorm:"foreignKey:EvaluatorID;references:ID"`
	Comment     string `json:"comment" gorm:"type:text"`
	Rating      int    `json:"rating" gorm:"check:rating >= 1 AND rating <= 5"`
}
