package models

import (
	"time"
)
type KPIMetric struct {
	ID        int       `json:"id" gorm:"primaryKey"`
	Name      string    `json:"name" gorm:"type:varchar(100);not null"`
	Weight    float64   `json:"weight" gorm:"not null"`
	CreatedAt time.Time `json:"created_at"`
}

type KPIScore struct {
	Model
	EmployeeID string    `json:"employee_id" gorm:"type:uuid;index"`
	MetricID   int       `json:"metric_id"`
	Metric     KPIMetric `json:"metric" gorm:"foreignKey:MetricID;references:ID"`
	Score      float64   `json:"score" gorm:"not null;check:score >= 0 AND score <= 100"`
	Date       time.Time `json:"date" gorm:"type:date;not null"`
}

type OKR struct {
	ID         int       `json:"id" gorm:"primaryKey"`
	EmployeeID string    `json:"employee_id" gorm:"type:uuid;index"`
	Objective  string    `json:"objective" gorm:"type:varchar(200);not null"`
	Progress   float64   `json:"progress" gorm:"check:progress >= 0 AND progress <= 100"`
	CreatedAt  time.Time `json:"created_at"`
	Tasks      []Task    `json:"tasks" gorm:"foreignKey:AssignedToID;references:ID"`
}

type Evaluation struct {
	EmployeeID     string        `json:"employee_id"`
	FinalKPIScore  float64       `json:"final_kpi_score"`
	KPIScores      []KPIScore    `json:"kpi_scores"`
	TaskFeedback   []TaskFeedback `json:"task_feedback"`
	Tasks          []Task        `json:"tasks"`
	OKRs           []OKR         `json:"okrs"`
}