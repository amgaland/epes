package services

import (
	"errors"

	"github.com/amgaland/epes/epes-back/config"
	"github.com/amgaland/epes/epes-back/models"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func GetAllActionTypes() ([]models.ActionType, error) {
	var actionTypes []models.ActionType
	if err := config.DB.Find(&actionTypes).Error; err != nil {
		return nil, err
	}
	return actionTypes, nil
}

func CreateActionType(actionType models.ActionType) (models.ActionType, error) {
	if err := config.DB.Create(&actionType).Error; err != nil {
		return models.ActionType{}, err
	}
	return actionType, nil
}

func UpdateActionType(id string, actionType models.ActionType) (models.ActionType, error) {
	if err := config.DB.Model(actionType).Where("ID = ?", id).Updates(actionType).Error; err != nil {
		return models.ActionType{}, err
	}
	return actionType, nil
}

func DeleteActionType(id string) error {
	if err := config.DB.Where("id = ?", id).Delete(&models.ActionType{}).Error; err != nil {
		return err
	}
	return nil
}

func GetActionTypeByID(id string, r *gin.Context) (*models.ActionType, error) {
	var actionType models.ActionType
	err := config.DB.Where("id = ?", id).First(&actionType).Error
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, nil
		}
		return nil, err
	}

	return &actionType, nil

}

func GetActionTypeByName(name string, r *gin.Context) (*models.ActionType, error) {
	var actionType models.ActionType
	err := config.DB.Where("name = ?", name).First(&actionType).Error
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, nil
		}
		return nil, err
	}

	return &actionType, nil

}
