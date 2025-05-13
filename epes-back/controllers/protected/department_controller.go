package controllers

import (
	"net/http"

	"github.com/amgaland/epes/epes-back/models"
	services "github.com/amgaland/epes/epes-back/services/protected"
	"github.com/gin-gonic/gin"
)

func GetAllDepartments(c *gin.Context) {
	id := c.Query("id")

	if id != "" {
		departments, err := services.GetDepartmentByID(id, c)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch department by id"})
			return
		}
		if departments == nil {
			c.JSON(http.StatusNotFound, gin.H{"error": "Department not found"})
			return
		}
		c.JSON(http.StatusOK, departments)
		return
	}

	deparments, err := services.GetAllDepartments(c)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, deparments)
}

func CreateDepartment(c *gin.Context) {
	var department models.Department
	if err := c.ShouldBindJSON(&department); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request payload"})
		return
	}

	createdDepartment, err := services.CreateDepartment(department)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusCreated, createdDepartment)
}

func UpdateDepartment(c *gin.Context) {
	id := c.Param("id")
	var updatedData models.Department
	if err := c.ShouldBindJSON(&updatedData); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request payload"})
		return
	}

	updatedDepartment, err := services.UpdateDepartment(id, updatedData)
	if err != nil {
		if err.Error() == "no department found with the given ID" {
			c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
		} else {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		}
		return
	}
	c.JSON(http.StatusOK, updatedDepartment)
}

func DeleteDepartment(c *gin.Context) {
	id := c.Param("id")
	if err := services.DeleteDepartment(id); err != nil {
		if err.Error() == "no department found with the given ID" {
			c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
		} else {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		}
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Department deleted successfully"})
}
