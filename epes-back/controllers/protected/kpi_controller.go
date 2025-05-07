package controllers

import (
	"net/http"
	"time"

	"github.com/amgaland/epes/epes-back/config"
	"github.com/amgaland/epes/epes-back/models"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

func CreateKPI(c *gin.Context) {
	var kpi models.KPI
	if err := c.ShouldBindJSON(&kpi); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	kpi.ID = uuid.New().String()
	kpi.CreatedAt = time.Now()
	if err := config.DB.Create(&kpi).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusCreated, kpi)
}

func CreateEmployeeKPI(c *gin.Context) {
	var empKPI models.EmployeeKPI
	if err := c.ShouldBindJSON(&empKPI); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	empKPI.ID = uuid.New().String()
	empKPI.EvaluatedAt = time.Now()

	// Optionally calculate status based on score
	score := empKPI.PerformanceScore
	if score >= 90 {
		empKPI.Status = "Excellent"
	} else if score >= 75 {
		empKPI.Status = "Good"
	} else {
		empKPI.Status = "Needs Improvement"
	}

	if err := config.DB.Create(&empKPI).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusCreated, empKPI)
}

func GetEmployeeKPIs(c *gin.Context) {
	var kpis []models.EmployeeKPI
	if err := config.DB.Preload("Employee").Find(&kpis).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, kpis)
}

func GetEmployeeKPIByID(c *gin.Context) {
	id := c.Param("id")
	var kpi models.EmployeeKPI
	if err := config.DB.Preload("Employee").First(&kpi, "employee_id = ?", id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "KPI not found"})
		return
	}
	c.JSON(http.StatusOK, kpi)
}

func UpdateEmployeeKPI(c *gin.Context) {
	id := c.Param("id")
	var updatedKPI models.EmployeeKPI
	if err := c.ShouldBindJSON(&updatedKPI); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	if err := config.DB.Model(&models.EmployeeKPI{}).Where("employee_id = ?", id).Updates(&updatedKPI).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "KPI updated successfully"})
}

func DeleteEmployeeKPI(c *gin.Context) {
	id := c.Param("id")
	if err := config.DB.Where("employee_id = ?", id).Delete(&models.EmployeeKPI{}).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "KPI deleted successfully"})
}
