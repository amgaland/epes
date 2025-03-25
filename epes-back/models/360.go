package models

import "time"


type Evaluation struct {
	Model
	EvaluatorID   string    `json:"evaluator_id"`
	Evaluator     User      `gorm:"foreignKey:EvaluatorID;references:ID"`
	EmployeeID    string    `json:"employee_id"`
	Employee      Employee  `gorm:"foreignKey:EmployeeID;references:ID"`
	Type          string    `json:"type"`         // Self, Manager, Peer
	Comments      string    `json:"comments"`
	OverallScore  float64   `json:"overall_score"`
	Period        string    `json:"period"`       // e.g., "Q1 2025"
	CompletedAt   time.Time `json:"completed_at"`
}
