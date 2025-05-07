package services

import (
	"errors"

	"github.com/amgaland/epes/epes-back/models"
	"gorm.io/gorm"
)

var db *gorm.DB // set this via init or inject from outside

func InitProjectMemberService(database *gorm.DB) {
	db = database
}

func GetProjectMemberByID(id string) (*models.ProjectMember, error) {
	var member models.ProjectMember
	err := db.Preload("User").Preload("Project").First(&member, "id = ?", id).Error
	if err != nil {
		return nil, err
	}
	return &member, nil
}

func CreateProjectMember(member models.ProjectMember) (*models.ProjectMember, error) {
	if member.ProjectID == "" || member.UserID == "" {
		return nil, errors.New("ProjectID and UserID are required")
	}
	err := db.Create(&member).Error
	return &member, err
}

func DeleteProjectMember(id string) error {
	return db.Delete(&models.ProjectMember{}, "id = ?", id).Error
}
