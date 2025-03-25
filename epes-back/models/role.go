package models

import "time"

type Role struct {
	Model
	Name string `json:"name" gorm:"unique"`
}

type Employee struct {
	Model
	UserID      string  `json:"user_id"`
	User        User    `gorm:"foreignKey:UserID;references:ID"`
	Position    string  `json:"position"`
	Department  string  `json:"department"`
	HireDate    time.Time `json:"hire_date"`
	ManagerID   *string  `json:"manager_id"`
}
