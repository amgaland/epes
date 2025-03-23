package services

import (
	"errors"
	"strings"

	"github.com/amgaland/epes/epes-back/config"
	"github.com/amgaland/epes/epes-back/models"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func GetAllRoles(r *gin.Context) ([]models.Role, error) {
	var roles []models.Role
	if err := config.DB.Find(&roles).Error; err != nil {
		return nil, err
	}

	return roles, nil
}

func CreateRole(role models.Role) (models.Role, error) {
	role.Name = strings.ToUpper(role.Name)
	if err := config.DB.Create(&role).Error; err != nil {
		return models.Role{}, err
	}
	return role, nil
}

func UpdateRole(id string, role models.Role) (models.Role, error) {
	if err := config.DB.Model(role).Where("ID = ?", id).Updates(role).Error; err != nil {
		return models.Role{}, err
	}
	return role, nil
}

func DeleteRole(id string) error {
	if err := config.DB.Where("id = ?", id).Delete(&models.Role{}).Error; err != nil {
		return err
	}
	return nil
}

func GetRoleByID(id string, r *gin.Context) (*models.Role, error) {

	var role models.Role

	err := config.DB.Where("id = ?", id).First(&role).Error
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, nil
		}
		return nil, err
	}

	return &role, nil
}
