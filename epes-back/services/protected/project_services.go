package services

import (
	"errors"

	"github.com/amgaland/epes/epes-back/config"
	"github.com/amgaland/epes/epes-back/models"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/lib/pq"
)

func GetAllProjects(c *gin.Context) ([]models.Project, error) {
    var projects []models.Project
    err := config.DB.Preload("TeamMembers").Preload("Owner").Find(&projects).Error
    return projects, err
}

func CreateProject(project models.Project) (models.Project, error) {
    tx := config.DB.Begin()
    if project.Name == "" {
        tx.Rollback()
        return models.Project{}, errors.New("name required")
    }
    var owner models.User
    if err := tx.Where("id = ?", project.OwnerID).First(&owner).Error; err != nil {
        tx.Rollback()
        return models.Project{}, errors.New("invalid owner")
    }
    project.ID = uuid.New().String()
    if err := tx.Create(&project).Error; err != nil {
        tx.Rollback()
        return models.Project{}, err
    }
    for i, tm := range project.TeamMembers {
        var user models.User
        if err := tx.Where("id = ?", tm.UserID).First(&user).Error; err != nil {
            tx.Rollback()
            return models.Project{}, errors.New("invalid user")
        }
        var member models.ProjectMember
        if err := tx.Where("project_id = ? AND user_id = ?", project.ID, tm.UserID).First(&member).Error; err == nil {
            member.RoleInProject = tm.RoleInProject
            if err := tx.Save(&member).Error; err != nil {
                tx.Rollback()
                return models.Project{}, err
            }
            continue
        }
        project.TeamMembers[i].ID = uuid.New().String()
        project.TeamMembers[i].ProjectID = project.ID
        if err := tx.Create(&project.TeamMembers[i]).Error; err != nil {
            tx.Rollback()
            return models.Project{}, err
        }
    }
    if err := tx.Commit().Error; err != nil {
        return models.Project{}, err
    }
    var created models.Project
    config.DB.Preload("TeamMembers").Preload("Owner").First(&created, "id = ?", project.ID)
    return created, nil
}

func UpdateProject(id string, project models.Project) (models.Project, error) {
    tx := config.DB.Begin()
    var existing models.Project
    if err := tx.First(&existing, "id = ?", id).Error; err != nil {
        tx.Rollback()
        return models.Project{}, err
    }

    // Validate owner if provided
    if project.OwnerID != "" {
        var owner models.User
        if err := tx.Where("id = ?", project.OwnerID).First(&owner).Error; err != nil {
            tx.Rollback()
            return models.Project{}, errors.New("invalid owner_id")
        }
    }

    // Update project
    updates := models.Project{
        Name:        project.Name,
        Description: project.Description,
        StartDate:   project.StartDate,
        EndDate:     project.EndDate,
        Status:      project.Status,
        OwnerID:     project.OwnerID,
    }
    if err := tx.Model(&existing).Updates(updates).Error; err != nil {
        tx.Rollback()
        return models.Project{}, err
    }

    // Clear and re-create team members
    tx.Where("project_id = ?", id).Delete(&models.ProjectMember{})
    for i, tm := range project.TeamMembers {
        var user models.User
        if err := tx.Where("id = ?", tm.UserID).First(&user).Error; err != nil {
            tx.Rollback()
            return models.Project{}, errors.New("invalid user_id")
        }
        var exists bool
        tx.Raw("SELECT EXISTS (SELECT 1 FROM project_members WHERE project_id = ? AND user_id = ?)", id, tm.UserID).Scan(&exists)
        if exists {
            tx.Rollback()
            return models.Project{}, errors.New("duplicate team member")
        }
        project.TeamMembers[i].ID = uuid.New().String()
        project.TeamMembers[i].ProjectID = id
    }
    if len(project.TeamMembers) > 0 {
        if err := tx.Create(&project.TeamMembers).Error; err != nil {
            tx.Rollback()
            if pqErr, ok := err.(*pq.Error); ok && pqErr.Code == "23505" {
                return models.Project{}, errors.New("duplicate team member")
            }
            return models.Project{}, err
        }
    }

    tx.Commit()
    var updated models.Project
    config.DB.Preload("TeamMembers").Preload("Owner").First(&updated, "id = ?", id)
    return updated, nil
}

func DeleteProject(id string) error {
    tx := config.DB.Begin()
    var project models.Project
    if err := tx.First(&project, "id = ?", id).Error; err != nil {
        tx.Rollback()
        return err
    }
    tx.Where("project_id = ?", id).Delete(&models.ProjectMember{})
    tx.Delete(&project)
    return tx.Commit().Error
}

func GetProjectByID(id string) (*models.Project, error) {
    var project models.Project
    err := config.DB.Preload("TeamMembers").Preload("Owner").First(&project, "id = ?", id).Error
    return &project, err
}

func GetAllProjectTasks(id string) ([]models.Task, error) {
    var tasks []models.Task
    err := config.DB.Preload("AssignedTo").Where("project_id = ?", id).Find(&tasks).Error
    return tasks, err
}