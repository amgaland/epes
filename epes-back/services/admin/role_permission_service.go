package services

import (
	"fmt"

	"github.com/amgaland/epes/epes-back/config"
	"github.com/amgaland/epes/epes-back/models"

	"gorm.io/gorm"
)

func GetAllRolePermissions(roleID string) ([]models.RolePermission, error) {
	var rolePermissions []models.RolePermission
	if err := config.DB.Preload("ActionType").Preload("Role").Where("role_id = ?").Error; err != nil {
		return nil, err
	}
	
	return rolePermissions, nil
}

func CreateRolePermission(rolePermission models.RolePermission) (models.RolePermission, error) {
	if err := config.DB.Create(&rolePermission).Error; err != nil {
		return models.RolePermission{}, err
	}
	return rolePermission, nil
}

func UpdateRolePermission(id string, rolePermission models.RolePermission) (models.RolePermission, error) {
	if err := config.DB.Model(rolePermission).Where("ID = ?", id).Updates(rolePermission).Error; err != nil {
		return models.RolePermission{}, err
	}
	return rolePermission, nil
}

func DeleteRolePermission(id string) error {
	if err := config.DB.Where("id = ?", id).Delete(&models.RolePermission{}).Error; err != nil {
		return err
	}
	return nil
}

func RolePermissionHandler(id string) (models.RolePermissionResponse, error) {
    var role models.Role
    if err := config.DB.Where("id = ?", id).First(&role).Error; err != nil {
        return models.RolePermissionResponse{}, err
    }

    var actionTypes []models.ActionType
    if err := config.DB.Find(&actionTypes).Error; err != nil {
        return models.RolePermissionResponse{}, err
    }

    var rolePermissions []models.RolePermission
    if err := config.DB.Preload("ActionType").Where("role_id = ?", id).Find(&rolePermissions).Error; err != nil {
        return models.RolePermissionResponse{}, err
    }

    actionTypeResponses := make([]models.ActionTypeResponse, len(actionTypes))
    for i, actionType := range actionTypes {
        permission := false
        for _, rolePermission := range rolePermissions {
            if rolePermission.ActionID == actionType.ID {
                permission = true
                break
            }
        }

        actionTypeResponses[i] = models.ActionTypeResponse{
            ID:         actionType.ID,
            Name:       actionType.Name,
            Permission: permission,
        }
    }

    rolePermissionResponse := models.RolePermissionResponse{
        Role:        role,
        ActionTypes: actionTypeResponses,
    }
    return rolePermissionResponse, nil
}







func UpdateRolePermissionHandler(RolePermissionRequestBody models.RolePermissionRequestBody) error {
	isPermission := RolePermissionRequestBody.Permission

	var role models.Role
	if err := config.DB.Where("id = ?", RolePermissionRequestBody.RoleID).First(&role).Error; err != nil {
		return fmt.Errorf("role with ID %s does not exist", RolePermissionRequestBody.RoleID)
	}

	var actionType models.ActionType
	if err := config.DB.Where("id=?", RolePermissionRequestBody.ActionID).First(&actionType).Error; err != nil {
		return err
	}

	if isPermission {
		var rolePermission models.RolePermission
		err := config.DB.Where("role_id = ? AND action_id = ?", RolePermissionRequestBody.RoleID, RolePermissionRequestBody.ActionID).First(&rolePermission).Error
		if err != nil {
			if err == gorm.ErrRecordNotFound {
				newRolePermission := models.RolePermission{
					RoleID:         RolePermissionRequestBody.RoleID,
					ActionID:       RolePermissionRequestBody.ActionID,
					ActionTypeName: actionType.Name,
				}
				if _, err := CreateRolePermission(newRolePermission); err != nil {
					return err
				}
			} else {
				return err
			}
		}
		return nil
	}
	var rolePermission models.RolePermission
	if err := config.DB.Where("role_id = ? AND action_id = ?", RolePermissionRequestBody.RoleID, RolePermissionRequestBody.ActionID).First(&rolePermission).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil
		}
		return err
	}

	if err := DeleteRolePermission(rolePermission.ID); err != nil {
		return err
	}

	return nil
}
