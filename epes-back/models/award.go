package models

import "time"
type Reward struct {
	Model
	EmployeeID  string    `json:"employee_id"`
	Employee    Employee  `gorm:"foreignKey:EmployeeID;references:ID"`
	Title       string    `json:"title"`
	Description string    `json:"description"`
	Points      int       `json:"points"`
	IssuedAt    time.Time `json:"issued_at"`
}
