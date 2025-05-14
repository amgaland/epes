package services

import (
	"errors"
	"log"
	"time"

	"github.com/amgaland/epes/epes-back/config"
	"github.com/amgaland/epes/epes-back/models"
	"github.com/gin-gonic/gin"
)

// computeKPI calculates KPI metrics for an employee and saves to the database
func computeKPI(c *gin.Context, employeeID string) (models.EmployeeKPI, error) {
	// Fetch the employee
	var user models.User
	if err := config.DB.First(&user, "id = ?", employeeID).Error; err != nil {
		log.Printf("Employee not found: %s, error: %v", employeeID, err)
		return models.EmployeeKPI{}, errors.New("employee not found")
	}

	// Fetch tasks assigned to the employee
	var tasks []models.Task
	if err := config.DB.Where("assigned_to_id = ?", employeeID).Preload("AssignedTo").Preload("Project").Preload("Project.Owner").Find(&tasks).Error; err != nil {
		log.Printf("Failed to fetch tasks for employee %s: %v", employeeID, err)
		return models.EmployeeKPI{}, errors.New("failed to fetch tasks: " + err.Error())
	}

	// Fetch project memberships for the employee
	var projectMembers []models.ProjectMember
	if err := config.DB.Where("user_id = ?", employeeID).Preload("Project").Preload("Project.Owner").Preload("User").Find(&projectMembers).Error; err != nil {
		log.Printf("Failed to fetch project members for employee %s: %v", employeeID, err)
		return models.EmployeeKPI{}, errors.New("failed to fetch project members: " + err.Error())
	}

	// Initialize EmployeeKPI struct
	kpi := models.EmployeeKPI{
		EmployeeID:  employeeID,
		Employee:    user,
		EvaluatedAt: time.Now(),
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
	} else {
		kpi.TaskCompletionRate = 0
	}

	// Compute project metrics
	for _, pm := range projectMembers {
		kpi.ProjectsAssigned++
		progress := 50.0 // Default for ongoing projects
		if pm.Project.Status == "Completed" {
			progress = 100.0
		} else if pm.Project.Status == "Delayed" {
			progress = 25.0
		}
		var teamCount int64
		if err := config.DB.Model(&models.ProjectMember{}).Where("project_id = ?", pm.ProjectID).Count(&teamCount).Error; err != nil {
			log.Printf("Failed to count team members for project %s: %v", pm.ProjectID, err)
			return models.EmployeeKPI{}, errors.New("failed to count team members: " + err.Error())
		}
		if teamCount > 0 {
			kpi.ProjectContribution += progress / float64(teamCount)
		}
	}
	if kpi.ProjectsAssigned > 0 {
		kpi.ProjectContribution /= float64(kpi.ProjectsAssigned)
	} else {
		kpi.ProjectContribution = 0
	}

	// Compute performance score (60% tasks, 40% projects)
	kpi.PerformanceScore = 0.6*kpi.TaskCompletionRate + 0.4*kpi.ProjectContribution

	// Assign status
	if kpi.PerformanceScore >= 80 {
		kpi.Status = "Excellent"
	} else if kpi.PerformanceScore >= 50 {
		kpi.Status = "Good"
	} else {
		kpi.Status = "Needs Improvement"
	}

	// Validate required fields
	if kpi.EmployeeID == "" || kpi.Status == "" {
		log.Printf("Invalid KPI for employee %s: missing required fields", employeeID)
		return models.EmployeeKPI{}, errors.New("invalid KPI: missing required fields")
	}

	// Save or update EmployeeKPI in the database
	tx := config.DB.Begin()
	defer func() {
		if r := recover(); r != nil {
			tx.Rollback()
		}
	}()

	// Check for existing KPI within the last 24 hours
	var existingKPI models.EmployeeKPI
	if err := tx.Where("employee_id = ? AND evaluated_at > ?", employeeID, time.Now().Add(-24*time.Hour)).Order("evaluated_at desc").First(&existingKPI).Error; err == nil {
		// Update existing KPI
		existingKPI.TaskCompletionRate = kpi.TaskCompletionRate
		existingKPI.TasksCompleted = kpi.TasksCompleted
		existingKPI.TasksAssigned = kpi.TasksAssigned
		existingKPI.ProjectContribution = kpi.ProjectContribution
		existingKPI.ProjectsAssigned = kpi.ProjectsAssigned
		existingKPI.PerformanceScore = kpi.PerformanceScore
		existingKPI.Status = kpi.Status
		existingKPI.EvaluatedAt = kpi.EvaluatedAt
		if userID, exists := c.Get("user_id"); exists {
			userIDStr := userID.(string)
			existingKPI.UpdatedBy = &userIDStr
		}
		if err := tx.Save(&existingKPI).Error; err != nil {
			tx.Rollback()
			log.Printf("Failed to update KPI for employee %s: %v", employeeID, err)
			return models.EmployeeKPI{}, errors.New("failed to update KPI record: " + err.Error())
		}
		kpi = existingKPI
	} else {
		// Create new KPI
		if userID, exists := c.Get("user_id"); exists {
			userIDStr := userID.(string)
			kpi.CreatedBy = &userIDStr
			kpi.UpdatedBy = &userIDStr
		}
		if err := tx.Create(&kpi).Error; err != nil {
			tx.Rollback()
			log.Printf("Failed to create KPI for employee %s: %v", employeeID, err)
			return models.EmployeeKPI{}, errors.New("failed to create KPI record: " + err.Error())
		}
	}

	if err := tx.Commit().Error; err != nil {
		log.Printf("Failed to commit transaction for employee %s: %v", employeeID, err)
		return models.EmployeeKPI{}, errors.New("failed to commit transaction: " + err.Error())
	}

	return kpi, nil
}

// GetAllKPIs retrieves KPIs for all active employees
func GetAllKPIs(c *gin.Context) ([]models.KPIResponse, error) {
	var users []models.User
	if err := config.DB.Where("is_active = ?", true).Find(&users).Error; err != nil {
		log.Printf("Failed to fetch users: %v", err)
		return nil, errors.New("failed to fetch users: " + err.Error())
	}

	var responses []models.KPIResponse
	for _, user := range users {
		kpi, err := computeKPI(c, user.ID)
		if err != nil {
			log.Printf("Failed to compute KPI for user %s: %v", user.ID, err)
			continue
		}

		// Fetch tasks and projects for KPIResponse
		var tasks []models.Task
		if err := config.DB.Where("assigned_to_id = ?", user.ID).Preload("AssignedTo").Preload("Project").Preload("Project.Owner").Find(&tasks).Error; err != nil {
			log.Printf("Failed to fetch tasks for user %s: %v", user.ID, err)
			continue
		}

		var projectMembers []models.ProjectMember
		if err := config.DB.Where("user_id = ?", user.ID).Preload("Project").Preload("Project.Owner").Preload("User").Find(&projectMembers).Error; err != nil {
			log.Printf("Failed to fetch project members for user %s: %v", user.ID, err)
			continue
		}

		projectsMap := make(map[string]models.Project)
		for _, pm := range projectMembers {
			projectsMap[pm.ProjectID] = pm.Project
		}
		var projects []models.Project
		for _, proj := range projectsMap {
			projects = append(projects, proj)
		}

		// Construct KPIResponse
		response := models.KPIResponse{
			EmployeeID:          kpi.EmployeeID,
			EmployeeName:        user.FirstName + " " + user.LastName,
			TaskCompletionRate:  kpi.TaskCompletionRate,
			TasksCompleted:      kpi.TasksCompleted,
			TasksAssigned:       kpi.TasksAssigned,
			ProjectContribution: kpi.ProjectContribution,
			ProjectsAssigned:    kpi.ProjectsAssigned,
			PerformanceScore:    kpi.PerformanceScore,
			Status:              kpi.Status,
			Tasks:               tasks,
			Projects:            projects,
		}

		// Handle empty name
		if response.EmployeeName == " " || response.EmployeeName == "" {
			response.EmployeeName = "Unknown"
		}

		responses = append(responses, response)
	}

	if len(responses) == 0 {
		log.Println("No valid KPIs found")
	}
	return responses, nil
}

// GetKPI retrieves KPI for a specific employee
func GetKPI(c *gin.Context, id string) (models.KPIResponse, error) {
	kpi, err := computeKPI(c, id)
	if err != nil {
		return models.KPIResponse{}, err
	}

	// Fetch tasks and projects
	var tasks []models.Task
	if err := config.DB.Where("assigned_to_id = ?", id).Preload("AssignedTo").Preload("Project").Preload("Project.Owner").Find(&tasks).Error; err != nil {
		log.Printf("Failed to fetch tasks for user %s: %v", id, err)
		return models.KPIResponse{}, errors.New("failed to fetch tasks: " + err.Error())
	}

	var projectMembers []models.ProjectMember
	if err := config.DB.Where("user_id = ?", id).Preload("Project").Preload("Project.Owner").Preload("User").Find(&projectMembers).Error; err != nil {
		log.Printf("Failed to fetch project members for user %s: %v", id, err)
		return models.KPIResponse{}, errors.New("failed to fetch project members: " + err.Error())
	}

	projectsMap := make(map[string]models.Project)
	for _, pm := range projectMembers {
		projectsMap[pm.ProjectID] = pm.Project
	}
	var projects []models.Project
	for _, proj := range projectsMap {
		projects = append(projects, proj)
	}

	// Construct KPIResponse
	response := models.KPIResponse{
		EmployeeID:          kpi.EmployeeID,
		EmployeeName:        kpi.Employee.FirstName + " " + kpi.Employee.LastName,
		TaskCompletionRate:  kpi.TaskCompletionRate,
		TasksCompleted:      kpi.TasksCompleted,
		TasksAssigned:       kpi.TasksAssigned,
		ProjectContribution: kpi.ProjectContribution,
		ProjectsAssigned:    kpi.ProjectsAssigned,
		PerformanceScore:    kpi.PerformanceScore,
		Status:              kpi.Status,
		Tasks:               tasks,
		Projects:            projects,
	}

	// Handle empty name
	if response.EmployeeName == " " || response.EmployeeName == "" {
		response.EmployeeName = "Unknown"
	}

	return response, nil
}
