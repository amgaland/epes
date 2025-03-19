package controllers

import (
	"net/http"

	"github.com/amgaland/epes/epes-back/models"
	services "github.com/amgaland/epes/epes-back/services/admin"
	"github.com/gin-gonic/gin"
)

func GetAllRoles(c *gin.Context) {
	id := c.Query("id")

	if id != "" {
		role, err := services.GetRoleByID(id, c)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch role"})
			return
		}
		if role == nil {
			c.JSON(http.StatusNotFound, gin.H{"error": "Role not found"})
			return
		}
		c.JSON(http.StatusOK, role)
		return
	}

	roles, err := services.GetAllRoles(c)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, roles)
}

func CreateRole(c *gin.Context) {
	var role models.Role
	if err := c.ShouldBindJSON(&role); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request payload"})
		return
	}

	createdRole, err := services.CreateRole(role)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusCreated, createdRole)
}

func UpdateRole(c *gin.Context) {
	id := c.Param("id")
	var updatedData models.Role
	if err := c.ShouldBindJSON(&updatedData); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request payload"})
		return
	}

	updatedRole, err := services.UpdateRole(id, updatedData)
	if err != nil {
		if err.Error() == "no role found with the given ID" {
			c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
		} else {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		}
		return
	}
	c.JSON(http.StatusOK, updatedRole)
}

func DeleteRole(c *gin.Context) {
	id := c.Param("id")
	if err := services.DeleteRole(id); err != nil {
		if err.Error() == "no role found with the given ID" {
			c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
		} else {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		}
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Role deleted successfully"})
}
