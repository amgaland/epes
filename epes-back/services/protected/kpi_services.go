package services

import (
	"errors"
	"time"

	"github.com/amgaland/epes/epes-back/config"
	"github.com/amgaland/epes/epes-back/models"
	"github.com/gin-gonic/gin"
)

// KPIResponse matches the frontend's expected format
type KPIResponse struct {
	EmployeeID          string          `json:"employee_id"`
	EmployeeName       string          `json:"employee_name"`
	TaskCompletionRate float64         `json:"task_completion_rate"`
	TasksCompleted     int             `json:"tasks_completed"`
	TasksAssigned      int             `json:"tasks_assigned"`
	ProjectContribution float64         `json:"project_contribution"`
	ProjectsAssigned    int             `json:"projects_assigned"`
	PerformanceScore    float64         `json:"performance_score"`
	Status             string          `json:"status"`
	Tasks              []models.Task   `json:"tasks,omitempty"`
	Projects           []models.Project `json:"projects,omitempty"`
}

// GetAllKPIs retrieves KPIs for all active employees
func GetAllKPIs(c *gin.Context) ([]KPIResponse, error) {
	var users []models.User
	if err := config.DB.Where("is_active = ?", true).Find(&users).Error; err != nil {
		return nil, errors.New("failed to fetch users: " + err.Error())
	}

	var responses []KPIResponse
	for _, user := range users {
		kpi, err := computeKPI(c, user.ID)
		if err != nil {
			continue // Skip users with no data
		}
		responses = append(responses, kpi)
	}

	return responses, nil
}

// GetKPI retrieves KPI for a specific employee
func GetKPI(c *gin.Context, id string) (KPIResponse, error) {
	var user models.User
	if err := config.DB.First(&user, "id = ?", id).Error; err != nil {
		return KPIResponse{}, errors.New("employee not found")
	}

	return computeKPI(c, id)
}

// CreateKPI creates a new KPI record
func CreateKPI(c *gin.Context, kpi KPIResponse) (KPIResponse, error) {
	tx := config.DB.Begin()
	defer func() {
		if r := recover(); r != nil {
			tx.Rollback()
		}
	}()

	// Validate employee
	var user models.User
	if err := tx.First(&user, "id = ?", kpi.EmployeeID).Error; err != nil {
		tx.Rollback()
		return KPIResponse{}, errors.New("invalid employee")
	}

	if kpi.EmployeeID == "" || kpi.TasksAssigned < 0 || kpi.TasksCompleted < 0 || kpi.ProjectsAssigned < 0 || kpi.ProjectContribution < 0 {
		tx.Rollback()
		return KPIResponse{}, errors.New("invalid KPI data")
	}

	// Find or create a generic KPI definition
	var kpiDef models.KPI
	if err := tx.Where("title = ?", "General Performance").First(&kpiDef).Error; err != nil {
		kpiDef = models.KPI{
			Title:       "General Performance",
			Description: "Aggregated performance metrics based on tasks and projects",
			TargetValue: 100,
			Weight:      1.0,
		}
		if err := tx.Create(&kpiDef).Error; err != nil {
			tx.Rollback()
			return KPIResponse{}, errors.New("failed to create KPI definition: " + err.Error())
		}
	}

	// Create EmployeeKPI record
	employeeKPI := models.EmployeeKPI{
		EmployeeID:  kpi.EmployeeID,
		EvaluatedAt: time.Now(),
	}

	// Set CreatedBy and UpdatedBy if available from context
	if userID, exists := c.Get("user_id"); exists {
		userIDStr := userID.(string)
		employeeKPI.CreatedBy = &userIDStr
		employeeKPI.UpdatedBy = &userIDStr
	}

	if err := tx.Create(&employeeKPI).Error; err != nil {
		tx.Rollback()
		return KPIResponse{}, errors.New("failed to create KPI record: " + err.Error())
	}

	if err := tx.Commit().Error; err != nil {
		return KPIResponse{}, errors.New("failed to commit transaction: " + err.Error())
	}

	// Recompute KPI to include tasks and projects
	created, err := computeKPI(c, kpi.EmployeeID)
	if err != nil {
		return KPIResponse{}, errors.New("failed to fetch created KPI: " + err.Error())
	}

	return created, nil
}

// UpdateKPI updates the latest KPI record for an employee
func UpdateKPI(c *gin.Context, id string, kpi KPIResponse) (KPIResponse, error) {
	tx := config.DB.Begin()
	defer func() {
		if r := recover(); r != nil {
			tx.Rollback()
		}
	}()

	// Validate employee
	var user models.User
	if err := tx.First(&user, "id = ?", id).Error; err != nil {
		tx.Rollback()
		return KPIResponse{}, errors.New("invalid employee")
	}

	if kpi.TasksAssigned < 0 || kpi.TasksCompleted < 0 || kpi.ProjectsAssigned < 0 || kpi.ProjectContribution < 0 {
		tx.Rollback()
		return KPIResponse{}, errors.New("invalid KPI data")
	}

	// Find latest KPI record
	var employeeKPI models.EmployeeKPI
	if err := tx.Where("employee_id = ?", id).Order("evaluated_at desc").First(&employeeKPI).Error; err != nil {
		tx.Rollback()
		return KPIResponse{}, errors.New("KPI record not found")
	}

	// Update fields
	employeeKPI.EvaluatedAt = time.Now()
	if userID, exists := c.Get("user_id"); exists {
		userIDStr := userID.(string)
		employeeKPI.UpdatedBy = &userIDStr
	}

	if err := tx.Save(&employeeKPI).Error; err != nil {
		tx.Rollback()
		return KPIResponse{}, errors.New("failed to update KPI record: " + err.Error())
	}

	if err := tx.Commit().Error; err != nil {
		return KPIResponse{}, errors.New("failed to commit transaction: " + err.Error())
	}

	// Recompute KPI to include tasks and projects
	updated, err := computeKPI(c, id)
	if err != nil {
		return KPIResponse{}, errors.New("failed to fetch updated KPI: " + err.Error())
	}

	return updated, nil
}

// DeleteKPI deletes all KPI records for an employee
func DeleteKPI(c *gin.Context, id string) error {
	tx := config.DB.Begin()
	defer func() {
		if r := recover(); r != nil {
			tx.Rollback()
		}
	}()

	// Validate employee
	var user models.User
	if err := tx.First(&user, "id = ?", id).Error; err != nil {
		tx.Rollback()
		return errors.New("invalid employee")
	}

	// Delete KPI records
	if err := tx.Where("employee_id = ?", id).Delete(&models.EmployeeKPI{}).Error; err != nil {
		tx.Rollback()
		return errors.New("failed to delete KPI records: " + err.Error())
	}

	if err := tx.Commit().Error; err != nil {
		return errors.New("failed to commit transaction: " + err.Error())
	}

	return nil
}

// GetTasks retrieves all tasks
func GetTasks(c *gin.Context) ([]models.Task, error) {
	var tasks []models.Task
	if err := config.DB.Preload("AssignedTo").Preload("Project").Find(&tasks).Error; err != nil {
		return nil, errors.New("failed to fetch tasks: " + err.Error())
	}
	return tasks, nil
}

// GetProjects retrieves all projects
func GetProjects(c *gin.Context) ([]models.Project, error) {
	var projects []models.Project
	if err := config.DB.Preload("TeamMembers.User").Preload("Owner").Find(&projects).Error; err != nil {
		return nil, errors.New("failed to fetch projects: " + err.Error())
	}
	return projects, nil
}

// computeKPI calculates KPI metrics for an employee
func computeKPI(c *gin.Context, employeeID string) (KPIResponse, error) {
	var user models.User
	if err := config.DB.First(&user, "id = ?", employeeID).Error; err != nil {
		return KPIResponse{}, errors.New("employee not found")
	}

	var tasks []models.Task
	if err := config.DB.Where("assigned_to_id = ?", employeeID).Preload("AssignedTo").Find(&tasks).Error; err != nil {
		return KPIResponse{}, errors.New("failed to fetch tasks: " + err.Error())
	}

	var projectMembers []models.ProjectMember
	if err := config.DB.Where("user_id = ?", employeeID).Preload("Project").Find(&projectMembers).Error; err != nil {
		return KPIResponse{}, errors.New("failed to fetch project members: " + err.Error())
	}

	kpi := KPIResponse{
		EmployeeID:   employeeID,
		EmployeeName: user.FirstName + " " + user.LastName,
	}

	// Compute task metrics
	for _, task := range tasks {
		kpi.TasksAssigned++
		if task.Status == "Completed" && (task.Deadline == nil || task.Deadline.After(time.Now())) {
			kpi.TasksCompleted++
		}
	}
	if kpi.TasksAssigned > 0 {
		kpi.TaskCompletionRate = (float64(kpi.TasksCompleted) / float64(kpi.TasksAssigned)) * 100
	}

	// Compute project metrics
	projectsMap := make(map[string]models.Project)
	for _, pm := range projectMembers {
		kpi.ProjectsAssigned++
		// Estimate progress based on project status
		progress := 50.0 // Default for ongoing projects
		if pm.Project.Status == "Completed" {
			progress = 100.0
		} else if pm.Project.Status == "Delayed" {
			progress = 25.0
		}
		// Count team members per project
		var teamCount int64
		if err := config.DB.Model(&models.ProjectMember{}).Where("project_id = ?", pm.ProjectID).Count(&teamCount).Error; err != nil {
			return KPIResponse{}, errors.New("failed to count team members: " + err.Error())
		}
		if teamCount > 0 {
			kpi.ProjectContribution += progress / float64(teamCount)
		}
		projectsMap[pm.ProjectID] = pm.Project
	}
	if kpi.ProjectsAssigned > 0 {
		kpi.ProjectContribution /= float64(kpi.ProjectsAssigned)
	}

	// Compute performance score
	kpi.PerformanceScore = 0.6*kpi.TaskCompletionRate + 0.4*kpi.ProjectContribution
	if kpi.PerformanceScore >= 80 {
		kpi.Status = "Excellent"
	} else if kpi.PerformanceScore >= 50 {
		kpi.Status = "Good"
	} else {
		kpi.Status = "Needs Improvement"
	}

	// Include tasks and projects
	kpi.Tasks = tasks
	for _, proj := range projectsMap {
		kpi.Projects = append(kpi.Projects, proj)
	}

	return kpi, nil
}