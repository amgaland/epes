package models

type ActionType struct {
	Model
	Name        string    `json:"name" gorm:"unique"`
	Description *string   `json:"description"`
}
