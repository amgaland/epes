package controllers

import (
	"net/http"

	"github.com/amgaland/epes/epes-back/models"
	services "github.com/amgaland/epes/epes-back/services/protected"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

// GetAllProjects handles fetching all projects or a specific project by ID
func GetAllProjects(c *gin.Context) {
	id := c.Query("id")

	if id != "" {
		project, err := services.GetProjectByID(id)
		if err != nil {
			if err == gorm.ErrRecordNotFound {
				c.JSON(http.StatusNotFound, gin.H{"error": "Project not found"})
			} else {
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch project"})
			}
			return
		}
		c.JSON(http.StatusOK, project)
		return
	}

	projects, err := services.GetAllProjects(c)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch projects"})
		return
	}
	c.JSON(http.StatusOK, projects)
}

// CreateProject handles project creation
func CreateProject(c *gin.Context) {
	var project models.Project
	if err := c.ShouldBindJSON(&project); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request payload"})
		return
	}

	newProject, err := services.CreateProject(project)
	if err != nil {
		if err == gorm.ErrInvalidData {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Project name is required"})
		} else {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create project: " + err.Error()})
		}
		return
	}

	c.JSON(http.StatusCreated, newProject)
}

// UpdateProject handles project updates
func UpdateProject(c *gin.Context) {
	id := c.Param("id")
	if id == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Project ID is required"})
		return
	}

	var updatedProject models.Project
	if err := c.ShouldBindJSON(&updatedProject); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request payload"})
		return
	}

	result, err := services.UpdateProject(id, updatedProject)
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, gin.H{"error": "Project not found"})
		} else {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update project: " + err.Error()})
		}
		return
	}

	c.JSON(http.StatusOK, result)
}

// DeleteProject handles project deletion
func DeleteProject(c *gin.Context) {
	id := c.Param("id")
	if id == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Project ID is required"})
		return
	}

	if err := services.DeleteProject(id); err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, gin.H{"error": "Project not found"})
		} else {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete project: " + err.Error()})
		}
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Project deleted successfully"})
}

// GetAllProjectTasks handles fetching all tasks for a project
func GetAllProjectTasks(c *gin.Context) {
	id := c.Param("id")
	if id == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Project ID is required"})
		return
	}

	tasks, err := services.GetAllProjectTasks(id)
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, gin.H{"error": "No tasks found for this project"})
		} else {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch tasks: " + err.Error()})
		}
		return
	}

	c.JSON(http.StatusOK, tasks)
}