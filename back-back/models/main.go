package models

import "time"

type Model struct {
	ID        string    `json:"id" gorm:"default:gen_random_uuid()"`
	CreatedAt time.Time `json:"created_at" gorm:"default:now()"`
	UpdatedAt time.Time `json:"updated_at" gorm:"default:now()"`
	CreatedBy *string   `json:"created_by" gorm:"references:User:ID"`
	UpdatedBy *string   `json:"updated_by" gorm:"references:User:ID"`
}
