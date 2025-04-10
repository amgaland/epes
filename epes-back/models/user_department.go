package models

type UserDepartment struct {
	Model
	UserID    string    `json:"user_id"`
	User      User      `json:"user" gorm:"foreignKey:UserID;references:ID"`
	DepartmentID    string    `json:"department_id"`
	Department      Department      `json:"department" gorm:"foreignKey:DepartmentID;references:ID"`
	DepartmentName  string    `json:"department_name"`
}

type UserDepartmentResponse struct {
	User  User           `json:"user"`
	Departments []DepartmentResponse `json:"departments"`
}

type DepartmentResponse struct {
	ID     string `json:"id"`
	Name   string `json:"name"`
	Active bool   `json:"active"`
}


type RequestBodyy struct {
    Active bool   `json:"active"`
    DepartmentID string `json:"department_id"`
    UserID string `json:"user_id"`
}