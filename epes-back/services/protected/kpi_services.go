package services

import (
	"errors"
	"time"

	"github.com/amgaland/epes/epes-back/config"
	"github.com/amgaland/epes/epes-back/models"
	"github.com/google/uuid"
)

func CreateNewKPI(kpi models.KPI) (models.KPI, error) {
	kpi.ID = uuid.New().String()
	kpi.CreatedAt = time.Now()
	if err := config.DB.Create(&kpi).Error; err != nil {
		return models.KPI{}, err
	}
	return kpi, nil
}

func CreateNewEmployeeKPI(empKPI models.EmployeeKPI) (models.EmployeeKPI, error) {
	empKPI.ID = uuid.New().String()
	empKPI.EvaluatedAt = time.Now()

	score := empKPI.PerformanceScore
	if score >= 90 {
		empKPI.Status = "Excellent"
	} else if score >= 75 {
		empKPI.Status = "Good"
	} else {
		empKPI.Status = "Needs Improvement"
	}

	if err := config.DB.Create(&empKPI).Error; err != nil {
		return models.EmployeeKPI{}, err
	}
	return empKPI, nil
}

func GetAllEmployeeKPIs() ([]models.EmployeeKPI, error) {
	var kpis []models.EmployeeKPI
	if err := config.DB.Preload("Employee").Find(&kpis).Error; err != nil {
		return nil, err
	}
	return kpis, nil
}

func GetEmployeeKPIByID(empID string) (models.EmployeeKPI, error) {
	var kpi models.EmployeeKPI
	if err := config.DB.Where("employee_id = ?", empID).Preload("Employee").First(&kpi).Error; err != nil {
		return models.EmployeeKPI{}, err
	}
	return kpi, nil
}

func DeleteKPIByID(id string) error {
	if err := config.DB.Delete(&models.EmployeeKPI{}, "id = ?", id).Error; err != nil {
		return err
	}
	return nil
}

func UpdateEmployeeKPIByID(id string, input models.EmployeeKPI) (models.EmployeeKPI, error) {
	var existing models.EmployeeKPI
	if err := config.DB.First(&existing, "id = ?", id).Error; err != nil {
		return models.EmployeeKPI{}, errors.New("KPI not found")
	}

	input.Status = "Needs Improvement"
	if input.PerformanceScore >= 90 {
		input.Status = "Excellent"
	} else if input.PerformanceScore >= 75 {
		input.Status = "Good"
	}

	if err := config.DB.Model(&existing).Updates(input).Error; err != nil {
		return models.EmployeeKPI{}, err
	}
	return existing, nil
}
