package models

import "time"

type User struct {
	Model
	FirstName           string     `json:"first_name"`
	LastName            string     `json:"last_name"`
	LoginID             string     `json:"login_id" gorm:"unique"`
	EmailWork           string     `json:"email_work"`
	EmailPersonal       *string    `json:"email_personal"`
	PhoneNumberWork     *string    `json:"phone_number_work"`
	PhoneNumberPersonal *string    `json:"phone_number_personal"`
	IsActive            *bool      `json:"is_active"`
	ActiveStartDate     time.Time  `json:"active_start_date"`
	ActiveEndDate       *time.Time `json:"active_end_date"`
	Password            string     `json:"password"`
}

type LoginUser struct {
	LoginID  string `json:"login_id"`
	Password string `json:"password"`
}

type UserWithRoles struct {
	ID                  string     `json:"id"`
	FirstName           string     `json:"first_name"`
	LastName            string     `json:"last_name"`
	EmailPersonal       string     `json:"email_personal"`
	EmailWork           string     `json:"email_work"`
	LoginID             string     `json:"login_id"`
	PhoneNumberPersonal string     `json:"phone_number_personal"`
	PhoneNumberWork     string     `json:"phone_number_work"`
	IsActive            bool       `json:"is_active"`
	Token               string     `json:"token"`
	ActiveStartDate     time.Time  `json:"active_start_date"`
	ActiveEndDate       *time.Time `json:"active_end_date,omitempty"`
	Roles               string     `json:"roles"`
}
