package models

import "time"

type Task struct {
	Model
	ProjectID      string     `json:"project_id"`
	Project        Project    `json:"project" gorm:"foreignKey:ProjectID;references:ID"`
	Title          string     `json:"title"`
	Description    string     `json:"description"`
	AssignedToID   string     `json:"assigned_to_id"`
	AssignedTo     User       `json:"assigned_to" gorm:"foreignKey:AssignedToID;references:ID"`
	Status         string     `json:"status"`         // e.g., "Pending", "In Progress", "Completed"
	Deadline       *time.Time `json:"deadline"`
	CompletedAt    *time.Time `json:"completed_at"`
}

type TaskFeedback struct {
	Model
	TaskID      string `json:"task_id"`
	Task        Task   `json:"task" gorm:"foreignKey:TaskID;references:ID"`
	EvaluatorID string `json:"evaluator_id"`
	Evaluator   User   `json:"evaluator" gorm:"foreignKey:EvaluatorID;references:ID"`
	Comment     string `json:"comment"`
	Rating      int    `json:"rating"`  // 1-5 or percentage
}
