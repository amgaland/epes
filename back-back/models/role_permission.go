package models

type RolePermission struct {
	Model
	RoleID      string      `json:"role_id"`
	Role        Role        `json:"role" gorm:"foreignKey:RoleID;references:ID"`
	ActionID    string      `json:"action_id"`
	ActionType  ActionType  `json:"action" gorm:"foreignKey:ActionID;references:ID"`
	Permission  bool        `json:"permission"`
	ActionTypeName string   `json:"actionType_name"`
}

type RolePermissionResponse struct{
	Role 		 Role 			`json:"role"`
	ActionTypes  []ActionTypeResponse  	`json:"actionType"`
}

type ActionTypeResponse struct {
	ID         string `json:"id"`
	Name       string `json:"name"`
	Permission bool   `json:"permission"`
}

type RolePermissionRequestBody struct {
	Permission bool `json:"permission"`
	ActionID string `json:"action_id"`
	RoleID string `json:"role_id"`
}