package models

import "time"

type Project struct {
	Model
	Name           string     `json:"name" gorm:"unique"`
	Description    string     `json:"description"`
	StartDate      time.Time  `json:"start_date"`
	EndDate        *time.Time `json:"end_date"`
	Status         string     `json:"status"`        // e.g., "Ongoing", "Completed", "Delayed"
	OwnerID        string     `json:"owner_id"`      // Reference to User
	Owner          User       `json:"owner" gorm:"foreignKey:OwnerID;references:ID"`
	// Relationship to team members
	TeamMembers []ProjectMember `json:"team_members" gorm:"foreignKey:ProjectID"`
}

type ProjectMember struct {
	Model
	ProjectID string  `json:"project_id"`
	Project   Project `json:"project" gorm:"foreignKey:ProjectID;references:ID"`

	UserID string `json:"user_id"`
	User   User   `json:"user" gorm:"foreignKey:UserID;references:ID"`

	RoleInProject string `json:"role_in_project"` // Optional: "Manager", "Developer", "QA", etc.
}
