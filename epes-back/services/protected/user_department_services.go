package services

import (
	"errors"

	"github.com/amgaland/epes/epes-back/config"
	"github.com/amgaland/epes/epes-back/models"
	"gorm.io/gorm"
)

func GetAllUserDepartments(userID string) ([]models.UserDepartment, error) {
	var userDepartments []models.UserDepartment
	if err := config.DB.Preload("Department").Preload("User").Where("user_id = ?", userID).Find(&userDepartments).Error; err != nil {
		return nil, err
	}
	return userDepartments, nil
}

func UserDepartmentHandler(userID string) (models.UserDepartmentResponse, error) {
	var user models.User
	if err := config.DB.Where("id = ?", userID).First(&user).Error; err != nil {
		return models.UserDepartmentResponse{}, err
	}

	var department []models.Department
	if err := config.DB.Find(&department).Error; err != nil {
		return models.UserDepartmentResponse{}, err
	}

	var userDepartments []models.UserDepartment
	if err := config.DB.Preload("Department").Where("user_id = ?", userID).Find(&userDepartments).Error; err != nil {
		return models.UserDepartmentResponse{}, err
	}

	departmentResponses := make([]models.DepartmentResponse, len(department))
	for i, department := range department {
		active := false
		for _, userDepartment := range userDepartments {
			if userDepartment.DepartmentID == department.ID {
				active = true
				break
			}
		}
		departmentResponses[i] = models.DepartmentResponse{
			ID:     department.ID,
			Name:   department.Name,
			Active: active,
		}
	}

	return models.UserDepartmentResponse{
		User:  user,
		Departments: departmentResponses,
	}, nil
}

func CreateUserDepartments(userID string, departmentIDs []string) error {
	for _, departmentID := range departmentIDs {
		userDepartment := models.UserDepartment{
			UserID: userID,
			DepartmentID: departmentID,
		}
		if err := config.DB.Create(&userDepartment).Error; err != nil {
			return err
		}
	}
	return nil
}

func CreateUserDepartment(userDepartment models.UserDepartment) (models.UserDepartment, error) {
	if err := config.DB.Create(&userDepartment).Preload("User").Preload("Department").Error; err != nil {
		return models.UserDepartment{}, err
	}
	return userDepartment, nil
}

func UpdateUserDepartment(id string, userDepartment models.UserDepartment) (models.UserDepartment, error) {
	if err := config.DB.Model(&userDepartment).Where("ID = ?", id).Updates(userDepartment).Error; err != nil {
		return models.UserDepartment{}, err
	}
	return userDepartment, nil
}

func DeleteUserDepartment(id string) error {
	if err := config.DB.Where("id = ?", id).Delete(&models.UserDepartment{}).Error; err != nil {
		return err
	}
	return nil
}

func UpdateUserDepartmentHandler(requestBody models.RequestBodyy) error {
	isActive := requestBody.Active

	var department models.Department
	if err := config.DB.Where("id = ?", requestBody.DepartmentID).First(&department).Error; err != nil {
		return err
	}

	if isActive {
		var userDepartment models.UserDepartment
		err := config.DB.Where("user_id = ? AND department_id = ?", requestBody.UserID, requestBody.DepartmentID).First(&userDepartment).Error
		if err != nil {
			if errors.Is(err, gorm.ErrRecordNotFound) {
				newUserDepartment := models.UserDepartment{
					UserID:   requestBody.UserID,
					DepartmentID:   requestBody.DepartmentID,
					DepartmentName: department.Name,
				}
				if _, err := CreateUserDepartment(newUserDepartment); err != nil {
					return err
				}
			} else {
				return err
			}
		}
		return nil
	}

	var userDepartment models.UserDepartment
	if err := config.DB.Where("user_id = ? AND department_id = ?", requestBody.UserID, requestBody.DepartmentID).First(&userDepartment).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil
		}
		return err
	}
	return DeleteUserDepartment(userDepartment.ID)
}
