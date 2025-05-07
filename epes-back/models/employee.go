package models

import (
	"github.com/google/uuid"
	"gorm.io/gorm"
)

type Employee struct {
  Model
  FirstName string    `gorm:"type:varchar(100)"`
  LastName  string    `gorm:"type:varchar(100)"`
  LoginID   string    `gorm:"type:varchar(50);unique"`
  EmailWork string    `gorm:"type:varchar(100);unique"`
  Role      string    `gorm:"type:varchar(20)"`
  Status    string    `gorm:"type:varchar(20)"`
  Projects  []Project `gorm:"many2many:employee_projects"`
  Tasks     []Task    `gorm:"foreignKey:AssignedTo"`
  Feedback  []Feedback
}

func (e *Employee) BeforeCreate(tx *gorm.DB) (err error) {
  e.ID = uuid.New().String()
  return
}