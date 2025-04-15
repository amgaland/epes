package controllers

import (
	"net/http"

	services "github.com/amgaland/epes/epes-back/services/protected"
	"github.com/gin-gonic/gin"
)

// GetAllKPIs handles GET /protected/kpi
func GetAllKPIs(c *gin.Context) {
	kpis, err := services.GetAllKPIs(c)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch KPIs: " + err.Error()})
		return
	}
	c.JSON(http.StatusOK, kpis)
}

// GetKPI handles GET /protected/kpi/{id}
func GetKPI(c *gin.Context) {
	id := c.Param("id")
	kpi, err := services.GetKPI(c, id)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Failed to fetch KPI: " + err.Error()})
		return
	}
	c.JSON(http.StatusOK, kpi)
}

// CreateKPI handles POST /protected/kpi
func CreateKPI(c *gin.Context) {
	var kpi services.KPIResponse
	if err := c.ShouldBindJSON(&kpi); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request body: " + err.Error()})
		return
	}

	if kpi.EmployeeID == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid KPI data: employee_id is required"})
		return
	}

	created, err := services.CreateKPI(c, kpi)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Failed to create KPI: " + err.Error()})
		return
	}
	c.JSON(http.StatusCreated, created)
}

// UpdateKPI handles PUT /protected/kpi/{id}
func UpdateKPI(c *gin.Context) {
	id := c.Param("id")
	var kpi services.KPIResponse
	if err := c.ShouldBindJSON(&kpi); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request body: " + err.Error()})
		return
	}

	updated, err := services.UpdateKPI(c, id, kpi)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Failed to update KPI: " + err.Error()})
		return
	}
	c.JSON(http.StatusOK, updated)
}

// DeleteKPI handles DELETE /protected/kpi/{id}
func DeleteKPI(c *gin.Context) {
	id := c.Param("id")
	if err := services.DeleteKPI(c, id); err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Failed to delete KPI: " + err.Error()})
		return
	}
	c.Status(http.StatusNoContent)
}

// GetTasks handles GET /protected/tasks
func GetTasks(c *gin.Context) {
	tasks, err := services.GetTasks(c)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch tasks: " + err.Error()})
		return
	}
	c.JSON(http.StatusOK, tasks)
}

// GetProjects handles GET /protected/projects
func GetProjects(c *gin.Context) {
	projects, err := services.GetProjects(c)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch projects: " + err.Error()})
		return
	}
	c.JSON(http.StatusOK, projects)
}