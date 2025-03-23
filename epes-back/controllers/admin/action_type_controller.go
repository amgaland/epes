package controllers

import (
	"net/http"

	"github.com/amgaland/epes/epes-back/models"
	services "github.com/amgaland/epes/epes-back/services/admin"
	"github.com/gin-gonic/gin"
)

func GetAllActionTypes(c *gin.Context) {
	id := c.Query("id")

	if id != "" {
		actionType, err := services.GetActionTypeByID(id, c)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch actionType"})
			return
		}
		if actionType == nil {
			c.JSON(http.StatusNotFound, gin.H{"error": "Action type not found"})
			return
		}
		c.JSON(http.StatusOK, actionType)
		return
	}

	actionTypes, err := services.GetAllActionTypes()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, actionTypes)
}

func CreateActionType(c *gin.Context) {
	var actionType models.ActionType
	if err := c.ShouldBindJSON(&actionType); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request payload"})
		return
	}

	createdActionType, err := services.CreateActionType(actionType)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusCreated, createdActionType)
}

func UpdateActionType(c *gin.Context) {
	id := c.Param("id")
	var updatedData models.ActionType
	if err := c.ShouldBindJSON(&updatedData); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request payload"})
		return
	}

	updatedActionType, err := services.UpdateActionType(id, updatedData)
	if err != nil {
		if err.Error() == "no action type found with the given ID" {
			c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
		} else {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		}
		return
	}
	c.JSON(http.StatusOK, updatedActionType)
}

func DeleteActionType(c *gin.Context) {
	id := c.Param("id")
	if err := services.DeleteActionType(id); err != nil {
		if err.Error() == "no action type found with the given ID" {
			c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
		} else {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		}
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Action type deleted successfully"})
}
