package services

import (
	"errors"
	"log"

	"github.com/amgaland/epes/epes-back/config"
	"github.com/amgaland/epes/epes-back/models"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

// CreateTask creates a new task with validation
func CreateTask(task models.Task) (models.Task, error) {
	tx := config.DB.Begin()
	if tx.Error != nil {
		return models.Task{}, tx.Error
	}

	// Validate required fields
	if task.ProjectID == "" {
		tx.Rollback()
		return models.Task{}, errors.New("project_id is required")
	}
	if task.Title == "" {
		tx.Rollback()
		return models.Task{}, errors.New("title is required")
	}
	if task.Status != "Pending" && task.Status != "In Progress" && task.Status != "Completed" {
		tx.Rollback()
		return models.Task{}, errors.New("status must be Pending, In Progress, or Completed")
	}

	// Validate project_id exists
	var project models.Project
	if err := tx.First(&project, "id = ?", task.ProjectID).Error; err != nil {
		tx.Rollback()
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return models.Task{}, errors.New("invalid project_id: project not found")
		}
		return models.Task{}, err
	}

	// Validate assigned_to_id if provided
	if task.AssignedToID != "" {
		var user models.User
		if err := tx.First(&user, "id = ?", *&task.AssignedToID).Error; err != nil {
			tx.Rollback()
			if errors.Is(err, gorm.ErrRecordNotFound) {
				return models.Task{}, errors.New("invalid assigned_to_id: user not found")
			}
			return models.Task{}, err
		}
	}

	// Log task creation attempt
	log.Printf("Creating task with ProjectID: %s, AssignedToID: %v", task.ProjectID, task.AssignedToID)

	// Create task
	if err := tx.Create(&task).Error; err != nil {
		log.Printf("Failed to create task: %v", err)
		tx.Rollback()
		return models.Task{}, err
	}

	// Fetch created task with associations
	var createdTask models.Task
	if err := tx.
		Preload("Project").
		Preload("AssignedTo").
		First(&createdTask, "id = ?", task.ID).Error; err != nil {
		tx.Rollback()
		return models.Task{}, err
	}

	if err := tx.Commit().Error; err != nil {
		return models.Task{}, err
	}

	return createdTask, nil
}

// GetAllTasks retrieves all tasks
func GetAllTasks(c *gin.Context) ([]models.Task, error) {
	var tasks []models.Task
	err := config.DB.
		Preload("Project").
		Preload("AssignedTo").
		Find(&tasks).Error
	if err != nil {
		return nil, err
	}
	return tasks, nil
}

// GetTaskByID retrieves a task by its ID
func GetTaskByID(id string, c *gin.Context) (*models.Task, error) {
	var task models.Task
	err := config.DB.
		Preload("Project").
		Preload("AssignedTo").
		First(&task, "id = ?", id).Error
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, nil
		}
		return nil, err
	}
	return &task, nil
}

// UpdateTask updates an existing task
func UpdateTask(id string, task models.Task) (models.Task, error) {
	tx := config.DB.Begin()
	if tx.Error != nil {
		return models.Task{}, tx.Error
	}

	// Check if task exists
	var existingTask models.Task
	if err := tx.First(&existingTask, "id = ?", id).Error; err != nil {
		tx.Rollback()
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return models.Task{}, errors.New("task not found")
		}
		return models.Task{}, err
	}

	// Validate fields
	if task.ProjectID != "" {
		var project models.Project
		if err := tx.First(&project, "id = ?", task.ProjectID).Error; err != nil {
			tx.Rollback()
			if errors.Is(err, gorm.ErrRecordNotFound) {
				return models.Task{}, errors.New("invalid project_id: project not found")
			}
			return models.Task{}, err
		}
	}
	if task.AssignedToID != "" {
		var user models.User
		if err := tx.First(&user, "id = ?", *&task.AssignedToID).Error; err != nil {
			tx.Rollback()
			if errors.Is(err, gorm.ErrRecordNotFound) {
				return models.Task{}, errors.New("invalid assigned_to_id: user not found")
			}
			return models.Task{}, err
		}
	}
	if task.Status != "" && task.Status != "Pending" && task.Status != "In Progress" && task.Status != "Completed" {
		tx.Rollback()
		return models.Task{}, errors.New("status must be Pending, In Progress, or Completed")
	}

	// Update fields
	updateData := models.Task{
		ProjectID:    task.ProjectID,
		Title:        task.Title,
		Description:  task.Description,
		AssignedToID: task.AssignedToID,
		Status:       task.Status,
		Deadline:     task.Deadline,
		CompletedAt:  task.CompletedAt,
	}
	if err := tx.Model(&existingTask).Updates(updateData).Error; err != nil {
		tx.Rollback()
		return models.Task{}, err
	}

	// Fetch updated task
	var updatedTask models.Task
	if err := tx.
		Preload("Project").
		Preload("AssignedTo").
		First(&updatedTask, "id = ?", id).Error; err != nil {
		tx.Rollback()
		return models.Task{}, err
	}

	if err := tx.Commit().Error; err != nil {
		return models.Task{}, err
	}

	return updatedTask, nil
}

// DeleteTask deletes a task
func DeleteTask(id string) error {
	tx := config.DB.Begin()
	if tx.Error != nil {
		return tx.Error
	}

	// Check if task exists
	var task models.Task
	if err := tx.First(&task, "id = ?", id).Error; err != nil {
		tx.Rollback()
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return errors.New("task not found")
		}
		return err
	}

	// Delete task
	if err := tx.Delete(&task).Error; err != nil {
		tx.Rollback()
		return err
	}

	return tx.Commit().Error
}