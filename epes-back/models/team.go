package models

import "time"

// Team model
type Team struct {
	Model
	Name        string    `json:"name"`               // Team name
	Description *string   `json:"description"`        // Optional description
	ProjectID   string    `json:"project_id"`         // Associated project
	Project     Project  `json:"project" gorm:"foreignKey:ProjectID;references:ID"`
	CreatedBy   string    `json:"created_by"`         // Creator of the team
}

// TeamMember model - join table between Users and Teams
type TeamMember struct {
	Model
	UserID  string `json:"user_id"`  // User ID
	User    User   `json:"user" gorm:"foreignKey:UserID;references:ID"`
	TeamID  string `json:"team_id"`  // Team ID
	Team    Team   `json:"team" gorm:"foreignKey:TeamID;references:ID"`
	Role    string `json:"role"`     // Role of the user within the team (e.g., "Leader", "Member")
	JoinedAt time.Time `json:"joined_at"` // When the user joined the team
}

