// kpi_controller.go
package controllers

import (
	"net/http"

	services "github.com/amgaland/epes/epes-back/services/protected"
	"github.com/gin-gonic/gin"
)

func GetAllKPIs(c *gin.Context) {
	kpis, err := services.GetAllKPIs(c)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch KPIs: " + err.Error()})
		return
	}
	c.JSON(http.StatusOK, kpis)
}

func GetKPI(c *gin.Context) {
	id := c.Param("id")
	kpi, err := services.GetKPI(c, id)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Failed to fetch KPI: " + err.Error()})
		return
	}
	c.JSON(http.StatusOK, kpi)
}