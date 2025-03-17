package controllers

import (
	"net/http"

	"github.com/amgaland/epes/epes-back/models"
	"github.com/amgaland/epes/epes-back/services"
	"github.com/gin-gonic/gin"
)

type Response struct {
    Message string      `json:"message"`
    Data    interface{} `json:"data,omitempty"`
    Error   string      `json:"error,omitempty"`
}

func GetUsers(c *gin.Context) {
    // Implement GetUsers logic
    c.JSON(http.StatusOK, Response{Message: "Users retrieved successfully"})
}

func GetUser(c *gin.Context) {
    id := c.Param("id")
    c.JSON(http.StatusOK, Response{Message: "User retrieved", Data: map[string]string{"id": id}})
}

func CreateUser(c *gin.Context) {
    var user models.User
    if err := c.ShouldBindJSON(&user); err != nil {
        c.JSON(http.StatusBadRequest, Response{Error: "Invalid request body"})
        return
    }

    if user.Name == "" || user.Email == "" {
        c.JSON(http.StatusBadRequest, Response{Error: "Name and email are required"})
        return
    }

    newUser, err := services.CreateUser(user, c.Request)
    if err != nil {
        c.JSON(http.StatusInternalServerError, Response{Error: err.Error()})
        return
    }

    c.JSON(http.StatusCreated, Response{Message: "User created successfully", Data: newUser})
}

func UpdateUser(c *gin.Context) {
    // Implement UpdateUser logic
    c.JSON(http.StatusOK, Response{Message: "User updated"})
}

func DeleteUser(c *gin.Context) {
    // Implement DeleteUser logic
    c.JSON(http.StatusOK, Response{Message: "User deleted"})
}