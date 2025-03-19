package models

type UserRole struct {
	Model
	UserID    string    `json:"user_id"`
	User      User      `json:"user" gorm:"foreignKey:UserID;references:ID"`
	RoleID    string    `json:"role_id"`
	Role      Role      `json:"role" gorm:"foreignKey:RoleID;references:ID"`
	RoleName  string    `json:"role_name"`
}

type UserRoleResponse struct {
	User  User           `json:"user"`
	Roles []RoleResponse `json:"roles"`
}

type RoleResponse struct {
	ID     string `json:"id"`
	Name   string `json:"name"`
	Active bool   `json:"active"`
}


type RequestBody struct {
    Active bool   `json:"active"`
    RoleID string `json:"role_id"`
    UserID string `json:"user_id"`
}