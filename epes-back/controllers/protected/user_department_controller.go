package controllers

import (
	"net/http"

	"github.com/amgaland/epes/epes-back/models"
	services "github.com/amgaland/epes/epes-back/services/protected"
	"github.com/gin-gonic/gin"
)

func GetAllUserDepartments(c *gin.Context) {
	userID := c.Query("user_id")

	userDepartments, err := services.GetAllUserDepartments(userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, userDepartments)
}

func CreateUserDepartment(c *gin.Context) {
	var userDepartment models.UserDepartment
	if err := c.ShouldBindJSON(&userDepartment); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request payload"})
		return
	}

	createdUserDepartment, err := services.CreateUserDepartment(userDepartment)
	if err != nil {

		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusCreated, createdUserDepartment)
}

func UpdateUserDepartment(c *gin.Context) {
	id := c.Param("id")
	var updatedData models.UserDepartment
	if err := c.ShouldBindJSON(&updatedData); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request payload"})
		return
	}

	updatedUserDepartment, err := services.UpdateUserDepartment(id, updatedData)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, updatedUserDepartment)
}

func DeleteUserDepartment(c *gin.Context) {
	id := c.Param("id")
	if err := services.DeleteUserDepartment(id); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "User repartment deleted successfully"})
}

func UserDepartmentHandler(c *gin.Context) {
	userID := c.Query("user_id")

	userDepartment, err := services.UserDepartmentHandler(userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, userDepartment)
}

func UpdateUserDepartmentHandler(c *gin.Context) {
	var requestBody models.RequestBodyy
	if err := c.ShouldBindJSON(&requestBody); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request body"})
		return
	}

	if err := services.UpdateUserDepartmentHandler(requestBody); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error updating user repartment"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "User repartment updated successfully"})
}
