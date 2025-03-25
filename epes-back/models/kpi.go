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
	EmployeeID  string    `json:"employee_id"`
	Employee    Employee  `gorm:"foreignKey:EmployeeID;references:ID"`
	KPIID       string    `json:"kpi_id"`
	KPI         KPI       `gorm:"foreignKey:KPIID;references:ID"`
	Score       float64   `json:"score"`
	EvaluatedAt time.Time `json:"evaluated_at"`
}
