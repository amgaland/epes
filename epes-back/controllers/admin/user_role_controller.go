package controllers

import (
	"net/http"

	"github.com/amgaland/epes/epes-back/models"
	services "github.com/amgaland/epes/epes-back/services/admin"
	"github.com/gin-gonic/gin"
)

func GetAllUserRoles(c *gin.Context) {
	userID := c.Query("user_id")

	userRoles, err := services.GetAllUserRoles(userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, userRoles)
}

func CreateUserRole(c *gin.Context) {
	var userRole models.UserRole
	if err := c.ShouldBindJSON(&userRole); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request payload"})
		return
	}

	createdUserRole, err := services.CreateUserRole(userRole)
	if err != nil {

		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusCreated, createdUserRole)
}

func UpdateUserRole(c *gin.Context) {
	id := c.Param("id")
	var updatedData models.UserRole
	if err := c.ShouldBindJSON(&updatedData); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request payload"})
		return
	}

	updatedUserRole, err := services.UpdateUserRole(id, updatedData)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, updatedUserRole)
}

func DeleteUserRole(c *gin.Context) {
	id := c.Param("id")
	if err := services.DeleteUserRole(id); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "User role deleted successfully"})
}

func UserRoleHandler(c *gin.Context) {
	userID := c.Query("user_id")

	userRole, err := services.UserRoleHandler(userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, userRole)
}

func UpdateUserRoleHandler(c *gin.Context) {
	var requestBody models.RequestBody
	if err := c.ShouldBindJSON(&requestBody); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request body"})
		return
	}

	if err := services.UpdateUserRoleHandler(requestBody); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error updating user role"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "User role updated successfully"})
}
