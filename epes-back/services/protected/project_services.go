package services

import (
	"github.com/amgaland/epes/epes-back/config"
	"github.com/amgaland/epes/epes-back/models"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

// GetAllProjects retrieves all projects with their associations
func GetAllProjects(c *gin.Context) ([]models.Project, error) {
	var projects []models.Project
	err := config.DB.
		Preload("TeamMembers").
		Preload("Owner").
		Find(&projects).Error
	if err != nil {
		return nil, err
	}
	return projects, nil
}

// CreateProject creates a new project with validation
func CreateProject(project models.Project) (models.Project, error) {
	tx := config.DB.Begin()
	if tx.Error != nil {
		return models.Project{}, tx.Error
	}

	// Validate required fields
	if project.Name == "" {
		tx.Rollback()
		return models.Project{}, gorm.ErrInvalidData
	}

	// Create project
	if err := tx.Create(&project).Error; err != nil {
		tx.Rollback()
		return models.Project{}, err
	}

	// Assign ProjectID to team members
	for i := range project.TeamMembers {
		project.TeamMembers[i].ProjectID = project.ID
	}

	// Create team members if any
	if len(project.TeamMembers) > 0 {
		if err := tx.Create(&project.TeamMembers).Error; err != nil {
			tx.Rollback()
			return models.Project{}, err
		}
	}

	if err := tx.Commit().Error; err != nil {
		return models.Project{}, err
	}

	// Fetch the created project with associations
	var createdProject models.Project
	if err := config.DB.
		Preload("TeamMembers").
		Preload("Owner").
		First(&createdProject, "id = ?", project.ID).Error; err != nil {
		return models.Project{}, err
	}

	return createdProject, nil
}

// UpdateProject updates an existing project
func UpdateProject(id string, project models.Project) (models.Project, error) {
	tx := config.DB.Begin()
	if tx.Error != nil {
		return models.Project{}, tx.Error
	}

	// Check if project exists
	var existingProject models.Project
	if err := tx.First(&existingProject, "id = ?", id).Error; err != nil {
		tx.Rollback()
		return models.Project{}, err
	}

	// Delete existing project members
	if err := tx.Where("project_id = ?", id).Delete(&models.ProjectMember{}).Error; err != nil {
		tx.Rollback()
		return models.Project{}, err
	}

	// Update project fields
	updateData := models.Project{
		Name:        project.Name,
		Description: project.Description,
		StartDate:   project.StartDate,
		EndDate:     project.EndDate,
		Status:      project.Status,
		OwnerID:     project.OwnerID,
	}
	if err := tx.Model(&existingProject).Updates(updateData).Error; err != nil {
		tx.Rollback()
		return models.Project{}, err
	}

	// Re-create project members if provided
	if len(project.TeamMembers) > 0 {
		for i := range project.TeamMembers {
			project.TeamMembers[i].ProjectID = id
		}
		if err := tx.Create(&project.TeamMembers).Error; err != nil {
			tx.Rollback()
			return models.Project{}, err
		}
	}

	// Fetch the updated project with associations
	var updatedProject models.Project
	if err := tx.Preload("TeamMembers").Preload("Owner").First(&updatedProject, "id = ?", id).Error; err != nil {
		tx.Rollback()
		return models.Project{}, err
	}

	if err := tx.Commit().Error; err != nil {
		return models.Project{}, err
	}

	return updatedProject, nil
}

// DeleteProject deletes a project and its associated members
func DeleteProject(id string) error {
	tx := config.DB.Begin()
	if tx.Error != nil {
		return tx.Error
	}

	// Check if project exists
	var project models.Project
	if err := tx.First(&project, "id = ?", id).Error; err != nil {
		tx.Rollback()
		return err
	}

	// Delete project members
	if err := tx.Where("project_id = ?", id).Delete(&models.ProjectMember{}).Error; err != nil {
		tx.Rollback()
		return err
	}

	// Delete the project
	if err := tx.Delete(&project).Error; err != nil {
		tx.Rollback()
		return err
	}

	return tx.Commit().Error
}

// GetProjectByID retrieves a project by its ID
func GetProjectByID(id string) (*models.Project, error) {
	var project models.Project
	err := config.DB.
		Preload("TeamMembers").
		Preload("Owner").
		First(&project, "id = ?", id).Error
	if err != nil {
		return nil, err
	}
	return &project, nil
}

// GetAllProjectTasks retrieves all tasks for a project
func GetAllProjectTasks(id string) ([]models.Task, error) {
	var tasks []models.Task
	err := config.DB.
		Preload("AssignedTo").
		Where("project_id = ?", id).
		Find(&tasks).Error
	if err != nil {
		return nil, err
	}
	return tasks, nil
}