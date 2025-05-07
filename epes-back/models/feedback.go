package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type Feedback struct {
  Model
  Text       string    `gorm:"type:text"`
  Author     string    `gorm:"type:varchar(100)"`
  CreatedAt  time.Time
  EmployeeID uuid.UUID `gorm:"type:uuid"`
}

func (f *Feedback) BeforeCreate(tx *gorm.DB) (err error) {
  f.ID = uuid.New().String()
  return
}