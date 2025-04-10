package services

import (
	"errors"
	"fmt"
	"log"

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
		User:        user,
		Departments: departmentResponses,
	}, nil
}

func CreateUserDepartments(userID string, departmentIDs []string) error {
	for _, departmentID := range departmentIDs {
		userDepartment := models.UserDepartment{
			UserID:       userID,
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
	return config.DB.Transaction(func(tx *gorm.DB) error {
		isActive := requestBody.Active
		log.Printf("Processing request: %+v", requestBody)

		// Check if the department exists using raw SQL to bypass GORM issues
		var count int
		err := tx.Raw("SELECT COUNT(*) FROM departments WHERE id = ?", requestBody.DepartmentID).Scan(&count).Error
		if err != nil {
			log.Printf("Error checking department existence: %v", err)
			return fmt.Errorf("error verifying department: %v", err)
		}
		if count == 0 {
			log.Printf("Department %s does not exist in departments table", requestBody.DepartmentID)
			return fmt.Errorf("department with ID %s does not exist", requestBody.DepartmentID)
		}

		// Load department details for logging and name
		var department models.Department
		if err := tx.Where("id = ?", requestBody.DepartmentID).First(&department).Error; err != nil {
			log.Printf("Unexpected error loading department %s: %v", requestBody.DepartmentID, err)
			return fmt.Errorf("failed to load department %s: %v", requestBody.DepartmentID, err)
		}
		log.Printf("Found department: ID=%s, Name=%s", department.ID, department.Name)

		if isActive {
			var userDepartment models.UserDepartment
			err := tx.Where("user_id = ? AND department_id = ?", requestBody.UserID, requestBody.DepartmentID).First(&userDepartment).Error
			if err != nil {
				if errors.Is(err, gorm.ErrRecordNotFound) {
					newUserDepartment := models.UserDepartment{
						UserID:         requestBody.UserID,
						DepartmentID:   requestBody.DepartmentID,
						DepartmentName: department.Name,
					}
					log.Printf("Creating new UserDepartment: %+v", newUserDepartment)
					if err := tx.Create(&newUserDepartment).Error; err != nil {
						log.Printf("Failed to create UserDepartment: %v", err)
						return fmt.Errorf("failed to create user department: %v", err)
					}
					log.Printf("Successfully created UserDepartment with ID: %s", newUserDepartment.ID)
				} else {
					log.Printf("Error querying UserDepartment: %v", err)
					return err
				}
			} else {
				log.Printf("UserDepartment already exists for user_id=%s, department_id=%s", requestBody.UserID, requestBody.DepartmentID)
			}
			return nil
		}

		// If not active, delete the UserDepartment if it exists
		var userDepartment models.UserDepartment
		if err := tx.Where("user_id = ? AND department_id = ?", requestBody.UserID, requestBody.DepartmentID).First(&userDepartment).Error; err != nil {
			if errors.Is(err, gorm.ErrRecordNotFound) {
				log.Printf("No UserDepartment found to delete for user_id=%s, department_id=%s", requestBody.UserID, requestBody.DepartmentID)
				return nil
			}
			log.Printf("Error querying UserDepartment for deletion: %v", err)
			return err
		}
		if err := tx.Where("id = ?", userDepartment.ID).Delete(&models.UserDepartment{}).Error; err != nil {
			log.Printf("Failed to delete UserDepartment: %v", err)
			return err
		}
		log.Printf("Successfully deleted UserDepartment with ID: %s", userDepartment.ID)
		return nil
	})
}