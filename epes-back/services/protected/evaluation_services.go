package services

import (
	"fmt"
	"time"

	"github.com/amgaland/epes/epes-back/config"
	"github.com/amgaland/epes/epes-back/models"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

func GetEvaluation(employeeID string, c *gin.Context) (models.Evaluation, error) {
	var evaluation models.Evaluation
	evaluation.EmployeeID = employeeID

	// Validate UUID
	if _, err := uuid.Parse(employeeID); err != nil {
		return models.Evaluation{}, fmt.Errorf("invalid employee_id")
	}

	// Fetch KPI scores
	var kpiScores []models.KPIScore
	if err := config.DB.Preload("Metric").Where("employee_id = ?", employeeID).Find(&kpiScores).Error; err != nil {
		return models.Evaluation{}, err
	}
	evaluation.KPIScores = kpiScores

	// Calculate final KPI score
	var totalScore, totalWeight float64
	for _, s := range kpiScores {
		totalScore += s.Score * s.Metric.Weight
		totalWeight += s.Metric.Weight
	}
	if totalWeight > 0 {
		evaluation.FinalKPIScore = totalScore / totalWeight
	}

	// Fetch task feedback
	var taskFeedback []models.TaskFeedback
	if err := config.DB.Preload("Task").Preload("Evaluator").Where("task_id IN (SELECT id FROM tasks WHERE assigned_to_id = ?)", employeeID).Find(&taskFeedback).Error; err != nil {
		return models.Evaluation{}, err
	}
	evaluation.TaskFeedback = taskFeedback

	// Fetch tasks
	var tasks []models.Task
	if err := config.DB.Preload("Project").Preload("AssignedTo").Where("assigned_to_id = ?", employeeID).Find(&tasks).Error; err != nil {
		return models.Evaluation{}, err
	}
	evaluation.Tasks = tasks

	// Fetch OKRs
	var okrs []models.OKR
	if err := config.DB.Preload("Tasks").Where("employee_id = ?", employeeID).Find(&okrs).Error; err != nil {
		return models.Evaluation{}, err
	}
	for i, okr := range okrs {
		var totalCompletion float64
		count := len(okr.Tasks)
		for _, task := range okr.Tasks {
			totalCompletion += task.CompletionScore
		}
		if count > 0 {
			okrs[i].Progress = totalCompletion / float64(count)
		}
	}
	evaluation.OKRs = okrs

	return evaluation, nil
}

func CreateKPIScore(kpiScore models.KPIScore) (models.KPIScore, error) {
	if kpiScore.EmployeeID == "" || kpiScore.MetricID == 0 || kpiScore.Score < 0 || kpiScore.Score > 100 {
		return models.KPIScore{}, fmt.Errorf("invalid KPI score data")
	}
	kpiScore.Date = time.Now()

	if err := config.DB.Create(&kpiScore).Error; err != nil {
		return models.KPIScore{}, err
	}
	return kpiScore, nil
}

func CreateTaskFeedback(feedback models.TaskFeedback) (models.TaskFeedback, error) {
	if feedback.TaskID == "" || feedback.EvaluatorID == "" || feedback.Rating < 1 || feedback.Rating > 5 {
		return models.TaskFeedback{}, fmt.Errorf("invalid feedback data")
	}

	if err := config.DB.Create(&feedback).Error; err != nil {
		return models.TaskFeedback{}, err
	}
	return feedback, nil
}

func GetEvaluationTasks(employeeID string, c *gin.Context) ([]models.Task, error) {
	if _, err := uuid.Parse(employeeID); err != nil {
		return nil, fmt.Errorf("invalid employee_id")
	}

	var tasks []models.Task
	if err := config.DB.Preload("Project").Preload("AssignedTo").Where("assigned_to_id = ?", employeeID).Find(&tasks).Error; err != nil {
		return nil, err
	}
	return tasks, nil
}

func GenerateEvaluationReport(c *gin.Context) ([]map[string]interface{}, error) {
	var users []struct {
		ID           string  `json:"id"`
		Name         string  `json:"name"`
		AvgKPIScore  float64 `json:"avg_kpi_score"`
		AvgFeedback  float64 `json:"avg_feedback"`
		OKRProgress  float64 `json:"okr_progress"`
	}

	if err := config.DB.Raw(`
		SELECT 
			u.id, 
			u.name, 
			COALESCE(AVG(ks.score), 0) as avg_kpi_score,
			COALESCE(AVG(tf.rating * 20), 0) as avg_feedback,
			COALESCE(AVG(okr.progress), 0) as okr_progress
		FROM users u
		LEFT JOIN kpi_scores ks ON u.id = ks.employee_id
		LEFT JOIN task_feedback tf ON tf.task_id IN (SELECT id FROM tasks WHERE assigned_to_id = u.id)
		LEFT JOIN okrs okr ON u.id = okr.employee_id
		GROUP BY u.id, u.name
	`).Scan(&users).Error; err != nil {
		return nil, err
	}

	result := make([]map[string]interface{}, len(users))
	for i, u := range users {
		result[i] = map[string]interface{}{
			"id":            u.ID,
			"name":          u.Name,
			"avg_kpi_score": u.AvgKPIScore,
			"avg_feedback":  u.AvgFeedback,
			"okr_progress":  u.OKRProgress,
		}
	}
	return result, nil
}

func CreateOKR(okr models.OKR) (models.OKR, error) {
	if okr.EmployeeID == "" || okr.Objective == "" {
		return models.OKR{}, fmt.Errorf("invalid OKR data")
	}

	if err := config.DB.Create(&okr).Error; err != nil {
		return models.OKR{}, err
	}
	return okr, nil
}

func UpdateTaskCompletionScore(taskID string, completionScore float64) error {
	if _, err := uuid.Parse(taskID); err != nil {
		return fmt.Errorf("invalid task_id")
	}
	if completionScore < 0 || completionScore > 100 {
		return fmt.Errorf("invalid completion score")
	}

	if err := config.DB.Model(&models.Task{}).Where("id = ?", taskID).Update("completion_score", completionScore).Error; err != nil {
		return err
	}

	var task models.Task
	if err := config.DB.Where("id = ?", taskID).First(&task).Error; err != nil {
		return err
	}

	var tasks []models.Task
	if err := config.DB.Where("assigned_to_id = ?", task.AssignedToID).Find(&tasks).Error; err != nil {
		return err
	}

	var totalCompletion float64
	count := len(tasks)
	for _, t := range tasks {
		totalCompletion += t.CompletionScore
	}
	progress := 0.0
	if count > 0 {
		progress = totalCompletion / float64(count)
	}

	if err := config.DB.Model(&models.OKR{}).Where("employee_id = ?", task.AssignedToID).Update("progress", progress).Error; err != nil {
		return err
	}
	return nil
}