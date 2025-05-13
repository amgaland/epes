package services

import (
	"errors"
	"strings"

	"github.com/amgaland/epes/epes-back/config"
	"github.com/amgaland/epes/epes-back/models"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func GetAllMetrics(c *gin.Context) ([]models.KPIMetric, error) {
	var metrics []models.KPIMetric
	if err := config.DB.Find(&metrics).Error; err != nil {
		return nil, err
	}
	return metrics, nil
}

func GetMetricByID(id int, c *gin.Context) (*models.KPIMetric, error) {
	var metric models.KPIMetric
	if err := config.DB.Where("id = ?", id).First(&metric).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, nil
		}
		return nil, err
	}
	return &metric, nil
}

func CreateMetric(metric models.KPIMetric) (models.KPIMetric, error) {
	if metric.Name == "" || metric.Weight < 0 || metric.Weight > 1 {
		return models.KPIMetric{}, errors.New("invalid metric data")
	}
	metric.Name = strings.TrimSpace(metric.Name)
	if err := config.DB.Create(&metric).Error; err != nil {
		return models.KPIMetric{}, err
	}
	return metric, nil
}

func UpdateMetric(id int, metric models.KPIMetric) (models.KPIMetric, error) {
	var existingMetric models.KPIMetric
	if err := config.DB.Where("id = ?", id).First(&existingMetric).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return models.KPIMetric{}, errors.New("no metric found with the given ID")
		}
		return models.KPIMetric{}, err
	}

	metric.Name = strings.TrimSpace(metric.Name)
	if metric.Name == "" || metric.Weight < 0 || metric.Weight > 1 {
		return models.KPIMetric{}, errors.New("invalid metric data")
	}

	if err := config.DB.Model(&existingMetric).Updates(metric).Error; err != nil {
		return models.KPIMetric{}, err
	}
	return existingMetric, nil
}

func DeleteMetric(id int) error {
	result := config.DB.Where("id = ?", id).Delete(&models.KPIMetric{})
	if result.Error != nil {
		return result.Error
	}
	if result.RowsAffected == 0 {
		return errors.New("no metric found with the given ID")
	}
	return nil
}