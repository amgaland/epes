package controllers

import (
	"fmt"
	"net/http"

	"github.com/amgaland/epes/epes-back/models"
	services "github.com/amgaland/epes/epes-back/services/admin"
	"github.com/gin-gonic/gin"
)

func GetAllRolePermissions(c *gin.Context) {
	roleID := c.Query("role_id")

	rolePermissions, err := services.GetAllRolePermissions(roleID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, rolePermissions)
}

func CreateRolePermission(c *gin.Context) {
	var rolePermission models.RolePermission

	if err := c.ShouldBindJSON(&rolePermission); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request payload"})
		return
	}

	if rolePermission.RoleID == "" || rolePermission.ActionID == "" {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "RoleID and ActionID are required fields and cannot be empty",
		})
		return
	}

	createdRolePermission, err := services.CreateRolePermission(rolePermission)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create role permission"})
		return
	}
	c.JSON(http.StatusCreated, createdRolePermission)
}

func UpdateRolePermission(c *gin.Context) {
	id := c.Param("id")
	var updatedData models.RolePermission
	if err := c.ShouldBindJSON(&updatedData); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request payload"})
		return
	}

	updatedRolePermission, err := services.UpdateRolePermission(id, updatedData)
	if err != nil {
		if err.Error() == "no role permission found with the given ID" {
			c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
		} else {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		}
		return
	}
	c.JSON(http.StatusOK, updatedRolePermission)
}

func DeleteRolePermission(c *gin.Context) {
	id := c.Param("id")
	if err := services.DeleteRolePermission(id); err != nil {
		if err.Error() == "no role permission found with the given ID" {
			c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
		} else {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		}
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Role permission deleted successfully"})
}

func RolePermissionHandler(c *gin.Context) {
	roleID := c.Query("role_id")

	rolePermission, err := services.RolePermissionHandler(roleID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, rolePermission)
}

func UpdateRolePermissionHandler(c *gin.Context) {
	var rolePermissionRequestBody models.RolePermissionRequestBody
	if err := c.ShouldBindJSON(&rolePermissionRequestBody); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request body"})
		return
	}
	if err := services.UpdateRolePermissionHandler(rolePermissionRequestBody); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": fmt.Sprintf("Error updating role permission: %v", err)})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Role permission updated successfully"})
}
