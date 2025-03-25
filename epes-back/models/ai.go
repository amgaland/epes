package models

import "time"

type AIAnalysis struct {
	Model
	EmployeeID  string    `json:"employee_id"`
	Employee    Employee  `gorm:"foreignKey:EmployeeID;references:ID"`
	Type        string    `json:"type"`    // e.g., "Bias Detection", "Sentiment Analysis"
	Result      string    `json:"result"`  // JSON or text output
	GeneratedAt time.Time `json:"generated_at"`
}
