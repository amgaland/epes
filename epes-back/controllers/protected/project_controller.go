package controllers

import (
	"net/http"

	"github.com/amgaland/epes/epes-back/models"
	services "github.com/amgaland/epes/epes-back/services/protected"
	"github.com/gin-gonic/gin"
)

func GetAllProjects(c *gin.Context) {
    id := c.Query("id")
    if id != "" {
        project, err := services.GetProjectByID(id)
        if err != nil {
            c.JSON(http.StatusNotFound, gin.H{"error": "Project not found"})
            return
        }
        c.JSON(http.StatusOK, project)
        return
    }
    projects, err := services.GetAllProjects(c)
    if err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
        return
    }
    c.JSON(http.StatusOK, projects)
}

func CreateProject(c *gin.Context) {
    var project models.Project
    if err := c.ShouldBindJSON(&project); err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
        return
    }
    newProject, err := services.CreateProject(project)
    if err != nil {
        switch err.Error() {
        case "name required", "invalid owner", "invalid user":
            c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
        default:
            c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
        }
        return
    }
    c.JSON(http.StatusCreated, newProject)
}

func UpdateProject(c *gin.Context) {
    id := c.Param("id")
    var project models.Project
    if err := c.ShouldBindJSON(&project); err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
        return
    }
    updated, err := services.UpdateProject(id, project)
    if err != nil {
        switch err.Error() {
        case "invalid owner_id", "invalid user_id":
            c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
        default:
            c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
        }
        return
    }
    c.JSON(http.StatusOK, updated)
}

func DeleteProject(c *gin.Context) {
    id := c.Param("id")
    if err := services.DeleteProject(id); err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
        return
    }
    c.JSON(http.StatusOK, gin.H{"message": "Project deleted"})
}

func GetAllProjectTasks(c *gin.Context) {
    id := c.Param("id")
    tasks, err := services.GetAllProjectTasks(id)
    if err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
        return
    }
    c.JSON(http.StatusOK, tasks)
}