package controllers

import (
	"net/http"

	"github.com/amgaland/epes/epes-back/models"
	services "github.com/amgaland/epes/epes-back/services/protected"
	"github.com/gin-gonic/gin"
)

func GetAllTasks(c *gin.Context) {
	id := c.Query("id")

	if id != "" {
		task, err := services.GetTaskByID(id, c)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch task", "details": err.Error()})
			return
		}
		if task == nil {
			c.JSON(http.StatusNotFound, gin.H{"error": "Task not found"})
			return
		}
		c.JSON(http.StatusOK, task)
		return
	}

	tasks, err := services.GetAllTasks(c)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch tasks", "details": err.Error()})
		return
	}
	c.JSON(http.StatusOK, tasks)
}

func CreateTask(c *gin.Context) {
	var task models.Task
	if err := c.ShouldBindJSON(&task); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error":   "Invalid request payload",
			"details": err.Error(),
		})
		return
	}

	newTask, err := services.CreateTask(task)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error":   "Failed to create task",
			"details": err.Error(),
		})
		return
	}

	c.JSON(http.StatusCreated, newTask)
}

func UpdateTask(c *gin.Context) {
	id := c.Param("id")
	var task models.Task

	if err := c.ShouldBindJSON(&task); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error":   "Invalid request payload",
			"details": err.Error(),
		})
		return
	}

	updatedTask, err := services.UpdateTask(id, task)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":   "Failed to update task",
			"details": err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, updatedTask)
}

func DeleteTask(c *gin.Context) {
	id := c.Param("id")

	if err := services.DeleteTask(id); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":   "Failed to delete task",
			"details": err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Task deleted successfully"})
}

func CheckTaskIDExists(c *gin.Context) {
	id := c.Query("id")

	task, err := services.GetTaskByID(id, c)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":   "Failed to fetch task",
			"details": err.Error(),
		})
		return
	}
	if task == nil {
		c.JSON(http.StatusNotFound, gin.H{"exists": false})
		return
	}
	c.JSON(http.StatusOK, gin.H{"exists": true})
}