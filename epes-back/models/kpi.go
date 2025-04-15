package models

import "time"

type KPI struct {
	Model
	Title       string  `json:"title"`
	Description string  `json:"description"`
	TargetValue float64 `json:"target_value"`
	Weight      float64 `json:"weight"` // KPI importance
}

type EmployeeKPI struct {
	Model
	EmployeeID          string     `json:"employee_id" gorm:"not null"`
	Employee            User       `json:"employee" gorm:"foreignKey:EmployeeID;references:ID"`
	TaskCompletionRate  float64    `json:"task_completion_rate"`
	TasksCompleted      int        `json:"tasks_completed"`
	TasksAssigned       int        `json:"tasks_assigned"`
	ProjectContribution float64    `json:"project_contribution"`
	ProjectsAssigned    int        `json:"projects_assigned"`
	PerformanceScore    float64    `json:"performance_score"`
	Status              string     `json:"status"` // "Excellent", "Good", "Needs Improvement"
	EvaluatedAt         time.Time  `json:"evaluated_at" gorm:"not null"`
}

type KPIResponse struct {
	EmployeeID          string    `json:"employee_id"`
	EmployeeName       string    `json:"employee_name"`
	TaskCompletionRate float64   `json:"task_completion_rate"`
	TasksCompleted     int       `json:"tasks_completed"`
	TasksAssigned      int       `json:"tasks_assigned"`
	ProjectContribution float64   `json:"project_contribution"`
	ProjectsAssigned    int       `json:"projects_assigned"`
	PerformanceScore    float64   `json:"performance_score"`
	Status             string    `json:"status"`
	Tasks              []Task    `json:"tasks,omitempty"`
	Projects           []Project `json:"projects,omitempty"`
}