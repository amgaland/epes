package controllers

import (
	"fmt"
	"net/http"

	"github.com/amgaland/epes/epes-back/models"
	services "github.com/amgaland/epes/epes-back/services/protected"
	"github.com/gin-gonic/gin"
)

func GetEvaluationScores(c *gin.Context) {
	employeeID := c.Query("employee_id")
	if employeeID == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Missing employee_id"})
		return
	}

	evaluation, err := services.GetEvaluation(employeeID, c)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch evaluation"})
		return
	}
	c.JSON(http.StatusOK, evaluation)
}

func CreateKPIScore(c *gin.Context) {
	var kpiScore models.KPIScore
	if err := c.ShouldBindJSON(&kpiScore); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request payload"})
		return
	}

	createdScore, err := services.CreateKPIScore(kpiScore)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusCreated, createdScore)
}

func CreateTaskFeedback(c *gin.Context) {
	var feedback models.TaskFeedback
	if err := c.ShouldBindJSON(&feedback); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request payload"})
		return
	}

	createdFeedback, err := services.CreateTaskFeedback(feedback)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusCreated, createdFeedback)
}

func GetEvaluationTasks(c *gin.Context) {
	employeeID := c.Query("employee_id")
	if employeeID == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Missing employee_id"})
		return
	}

	tasks, err := services.GetEvaluationTasks(employeeID, c)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, tasks)
}

func CreateEvaluationReport(c *gin.Context) {
	users, err := services.GenerateEvaluationReport(c)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.Header("Content-Type", "text/csv")
	c.Header("Content-Disposition", "attachment;filename=evaluation_report.csv")

	fmt.Fprintln(c.Writer, "Employee ID,Name,Average KPI Score,Average Feedback Score,OKR Progress")
	for _, u := range users {
		fmt.Fprintf(c.Writer, "%s,%s,%.2f,%.2f,%.2f\n",
			u["id"], u["name"], u["avg_kpi_score"], u["avg_feedback"], u["okr_progress"])
	}
}

func CreateOKR(c *gin.Context) {
	var okr models.OKR
	if err := c.ShouldBindJSON(&okr); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request payload"})
		return
	}

	createdOKR, err := services.CreateOKR(okr)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusCreated, createdOKR)
}

func UpdateTaskCompletionScore(c *gin.Context) {
	var updateData struct {
		TaskID         string  `json:"task_id"`
		CompletionScore float64 `json:"completion_score"`
	}
	if err := c.ShouldBindJSON(&updateData); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request payload"})
		return
	}

	err := services.UpdateTaskCompletionScore(updateData.TaskID, updateData.CompletionScore)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Task completion score updated"})
}