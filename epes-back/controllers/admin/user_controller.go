package controllers

import (
	"net/http"

	"github.com/amgaland/epes/epes-back/models"
	services "github.com/amgaland/epes/epes-back/services/admin"
	"github.com/gin-gonic/gin"
)

func GetAllUsers(c *gin.Context) {
	id := c.Query("id")

	if id != "" {
		user, err := services.GetUserByID(id, c)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch user"})
			return
		}
		if user == nil {
			c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
			return
		}
		c.JSON(http.StatusOK, user)
		return
	}

	users, err := services.GetAllUsers(c)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch users"})
		return
	}
	c.JSON(http.StatusOK, users)
}

func CreateUser(c *gin.Context) {
	var user models.User
	if err := c.ShouldBindJSON(&user); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request payload"})
		return
	}

	newUser, err := services.CreateUser(user, c.Request)
	if err != nil {

		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}


	c.JSON(http.StatusCreated, newUser)
}

func UpdateUser(c *gin.Context) {
	id := c.Param("id")
	var user models.User

	if err := c.ShouldBindJSON(&user); err != nil {

		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request payload"})
		return
	}

	updatedUser, err := services.UpdateUser(id, user, c.Request)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update user"})
		return
	}

	c.JSON(http.StatusOK, updatedUser)
}

func DeleteUser(c *gin.Context) {
	id := c.Param("id")

	if err := services.DeleteUser(id, c.Request); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete user"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "User deleted successfully"})
}

func CheckLoginIDExists(c *gin.Context) {
	loginID := c.Query("login_id")
	if loginID == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "login_id is required"})
		return
	}

	exists, err := services.CheckLoginIDExists(loginID, c)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to check login_id"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"exists": exists})
}
