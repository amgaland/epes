package models

import "time"

type EmployeeEvaluationReport struct {
	Model
	EmployeeID  string `json:"employee_id"`
	Employee    Employee `gorm:"foreignKey:EmployeeID"`
	Period      string `json:"period"`   // e.g., "Q1 2025"
	ReportData  string `json:"report_data"` // JSON or HTML summary
	GeneratedBy string `json:"generated_by"`
	GeneratedAt time.Time `json:"generated_at"`
}
