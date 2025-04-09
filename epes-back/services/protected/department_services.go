package services

import (
	"errors"
	"strings"

	"github.com/amgaland/epes/epes-back/config"
	"github.com/amgaland/epes/epes-back/models"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func GetAllDepartments(r *gin.Context) ([]models.Department, error) {
	var departments []models.Department
	if err := config.DB.Find(&departments).Error; err != nil {
		return nil, err
	}

	return departments, nil
}

func CreateDepartment(department models.Department) (models.Department, error) {
	department.Name = strings.ToUpper(department.Name)
	if err := config.DB.Create(&department).Error; err != nil {
		return models.Department{}, err
	}
	return department, nil
}

func UpdateDepartment(id string, department models.Department) (models.Department, error) {
	if err := config.DB.Model(department).Where("ID = ?", id).Updates(department).Error; err != nil {
		return models.Department{}, err
	}
	return department, nil
}

func DeleteDepartment(id string) error {
	if err := config.DB.Where("id = ?", id).Delete(&models.Department{}).Error; err != nil {
		return err
	}
	return nil
}

func GetDepartmentByID(id string, r *gin.Context) (*models.Department, error) {

	var department models.Department

	err := config.DB.Where("id = ?", id).First(&department).Error
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, nil
		}
		return nil, err
	}

	return &department, nil
}
