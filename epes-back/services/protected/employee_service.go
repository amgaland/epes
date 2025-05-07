package services

import (
	"errors"

	"github.com/amgaland/epes/epes-back/config"
	"github.com/amgaland/epes/epes-back/models"
)

func GetAllEmployees() ([]models.Employee, error) {
	var employees []models.Employee
	err := config.DB.Preload("Projects").Preload("Tasks").Preload("Feedback").Find(&employees).Error
	return employees, err
}

func GetEmployeeByID(id string) (*models.Employee, error) {
	var employee models.Employee
	err := config.DB.Preload("Projects").Preload("Tasks").Preload("Feedback").First(&employee, "id = ?", id).Error
	return &employee, err
}

func CreateEmployee(employee models.Employee) (models.Employee, error) {
	err := config.DB.Create(&employee).Error
	return employee, err
}

func UpdateEmployee(id string, updated models.Employee) (models.Employee, error) {
	var employee models.Employee
	if err := config.DB.First(&employee, "id = ?", id).Error; err != nil {
		return models.Employee{}, errors.New("employee not found")
	}

	if err := config.DB.Model(&employee).Updates(updated).Error; err != nil {
		return models.Employee{}, err
	}
	return employee, nil
}

func DeleteEmployee(id string) error {
	var employee models.Employee
	if err := config.DB.First(&employee, "id = ?", id).Error; err != nil {
		return err
	}
	return config.DB.Delete(&employee).Error
}
