package services

import (
	"errors"

	"github.com/amgaland/epes/epes-back/config"
	"github.com/amgaland/epes/epes-back/models"
	"gorm.io/gorm"
)

func GetAllUserRoles(userID string) ([]models.UserRole, error) {
	var userRoles []models.UserRole
	if err := config.DB.Preload("Role").Preload("User").Where("user_id = ?", userID).Find(&userRoles).Error; err != nil {
		return nil, err
	}
	return userRoles, nil
}

func UserRoleHandler(userID string) (models.UserRoleResponse, error) {
	var user models.User
	if err := config.DB.Where("id = ?", userID).First(&user).Error; err != nil {
		return models.UserRoleResponse{}, err
	}

	var roles []models.Role
	if err := config.DB.Find(&roles).Error; err != nil {
		return models.UserRoleResponse{}, err
	}

	var userRoles []models.UserRole
	if err := config.DB.Preload("Role").Where("user_id = ?", userID).Find(&userRoles).Error; err != nil {
		return models.UserRoleResponse{}, err
	}

	roleResponses := make([]models.RoleResponse, len(roles))
	for i, role := range roles {
		active := false
		for _, userRole := range userRoles {
			if userRole.RoleID == role.ID {
				active = true
				break
			}
		}
		roleResponses[i] = models.RoleResponse{
			ID:     role.ID,
			Name:   role.Name,
			Active: active,
		}
	}

	return models.UserRoleResponse{
		User:  user,
		Roles: roleResponses,
	}, nil
}

func CreateUserRoles(userID string, roleIDs []string) error {
	for _, roleID := range roleIDs {
		userRole := models.UserRole{
			UserID: userID,
			RoleID: roleID,
		}
		if err := config.DB.Create(&userRole).Error; err != nil {
			return err
		}
	}
	return nil
}

func CreateUserRole(userRole models.UserRole) (models.UserRole, error) {
	if err := config.DB.Create(&userRole).Preload("User").Preload("Role").Error; err != nil {
		return models.UserRole{}, err
	}
	return userRole, nil
}

func UpdateUserRole(id string, userRole models.UserRole) (models.UserRole, error) {
	if err := config.DB.Model(&userRole).Where("ID = ?", id).Updates(userRole).Error; err != nil {
		return models.UserRole{}, err
	}
	return userRole, nil
}

func DeleteUserRole(id string) error {
	if err := config.DB.Where("id = ?", id).Delete(&models.UserRole{}).Error; err != nil {
		return err
	}
	return nil
}

func UpdateUserRoleHandler(requestBody models.RequestBody) error {
	isActive := requestBody.Active

	var role models.Role
	if err := config.DB.Where("id = ?", requestBody.RoleID).First(&role).Error; err != nil {
		return err
	}

	if isActive {
		var userRole models.UserRole
		err := config.DB.Where("user_id = ? AND role_id = ?", requestBody.UserID, requestBody.RoleID).First(&userRole).Error
		if err != nil {
			if errors.Is(err, gorm.ErrRecordNotFound) {
				newUserRole := models.UserRole{
					UserID:   requestBody.UserID,
					RoleID:   requestBody.RoleID,
					RoleName: role.Name,
				}
				if _, err := CreateUserRole(newUserRole); err != nil {
					return err
				}
			} else {
				return err
			}
		}
		return nil
	}

	var userRole models.UserRole
	if err := config.DB.Where("user_id = ? AND role_id = ?", requestBody.UserID, requestBody.RoleID).First(&userRole).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil
		}
		return err
	}
	return DeleteUserRole(userRole.ID)
}
