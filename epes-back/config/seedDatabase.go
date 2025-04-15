package config

import (
	"fmt"
	"time"

	"github.com/amgaland/epes/epes-back/models"
	"github.com/google/uuid"
	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
)

// SeedDatabase populates the database with initial data
func SeedDatabase(db *gorm.DB) error {
	// Check if database is already seeded
	var userCount int64
	if err := db.Model(&models.User{}).Count(&userCount).Error; err != nil {
		return fmt.Errorf("failed to check user count: %w", err)
	}
	if userCount > 0 {
		fmt.Println("Database already seeded, skipping seeding")
		return nil
	}

	// Start a transaction
	tx := db.Begin()
	defer func() {
		if r := recover(); r != nil {
			tx.Rollback()
		}
	}()

	// Create Departments
	deptIT := models.Department{
		Name:     "Information Technology",
		Location: "Building A",
	}
	deptHR := models.Department{
		Name:     "Human Resources",
		Location: "Building B",
	}
	departments := []models.Department{deptIT, deptHR}
	for i := range departments {
		departments[i].ID = uuid.New().String()
		if err := tx.Create(&departments[i]).Error; err != nil {
			tx.Rollback()
			return fmt.Errorf("failed to create department %s: %w", departments[i].Name, err)
		}
	}

	// Create ActionTypes
	actionView := models.ActionType{
		Name:        "VIEW",
		Description: ptrString("View resources"),
	}
	actionEdit := models.ActionType{
		Name:        "EDIT",
		Description: ptrString("Edit resources"),
	}
	actionTypes := []models.ActionType{actionView, actionEdit}
	for i := range actionTypes {
		actionTypes[i].ID = uuid.New().String()
		if err := tx.Create(&actionTypes[i]).Error; err != nil {
			tx.Rollback()
			return fmt.Errorf("failed to create action type %s: %w", actionTypes[i].Name, err)
		}
	}

	// Create Roles
	roleAdmin := models.Role{
		Name: "ADMIN",
	}
	roleEmployee := models.Role{
		Name: "EMPLOYEE",
	}
	roles := []models.Role{roleAdmin, roleEmployee}
	for i := range roles {
		roles[i].ID = uuid.New().String()
		if err := tx.Create(&roles[i]).Error; err != nil {
			tx.Rollback()
			return fmt.Errorf("failed to create role %s: %w", roles[i].Name, err)
		}
	}

	// Create RolePermissions
	rolePermissions := []models.RolePermission{
		{
			RoleID:         roleAdmin.ID,
			ActionID:       actionView.ID,
			Permission:     true,
			ActionTypeName: actionView.Name,
		},
		{
			RoleID:         roleAdmin.ID,
			ActionID:       actionEdit.ID,
			Permission:     true,
			ActionTypeName: actionEdit.Name,
		},
		{
			RoleID:         roleEmployee.ID,
			ActionID:       actionView.ID,
			Permission:     true,
			ActionTypeName: actionView.Name,
		},
	}
	for i := range rolePermissions {
		rolePermissions[i].ID = uuid.New().String()
		if err := tx.Create(&rolePermissions[i]).Error; err != nil {
			tx.Rollback()
			return fmt.Errorf("failed to create role permission for role %s: %w", rolePermissions[i].RoleID, err)
		}
	}

	// Create Users
	hashedPassword, _ := bcrypt.GenerateFromPassword([]byte("password123"), bcrypt.DefaultCost)
	adminUser := models.User{
		FirstName:       "Admin",
		LastName:        "User",
		LoginID:         "admin1",
		EmailWork:       "admin@company.com",
		Password:        string(hashedPassword),
		IsActive:        ptrBool(true),
		ActiveStartDate: time.Now(),
	}
	employee1 := models.User{
		FirstName:       "John",
		LastName:        "Doe",
		LoginID:         "john.doe",
		EmailWork:       "john.doe@company.com",
		EmailPersonal:   ptrString("john.personal@gmail.com"),
		Password:        string(hashedPassword),
		IsActive:        ptrBool(true),
		ActiveStartDate: time.Now(),
	}
	employee2 := models.User{
		FirstName:       "Jane",
		LastName:        "Smith",
		LoginID:         "jane.smith",
		EmailWork:       "jane.smith@company.com",
		EmailPersonal:   ptrString("jane.personal@gmail.com"),
		Password:        string(hashedPassword),
		IsActive:        ptrBool(true),
		ActiveStartDate: time.Now(),
	}
	users := []models.User{adminUser, employee1, employee2}
	for i := range users {
		users[i].ID = uuid.New().String()
		if err := tx.Create(&users[i]).Error; err != nil {
			tx.Rollback()
			return fmt.Errorf("failed to create user %s: %w", users[i].LoginID, err)
		}
	}

	// Create UserWithRoles
	adminRoles := models.UserWithRoles{
		ID:              adminUser.ID,
		FirstName:       adminUser.FirstName,
		LastName:        adminUser.LastName,
		EmailWork:       adminUser.EmailWork,
		EmailPersonal:   "",
		LoginID:         adminUser.LoginID,
		IsActive:        true,
		ActiveStartDate: adminUser.ActiveStartDate,
		Token:           "admin_token_123", // Replace with JWT if needed
		Roles:           "ADMIN,EMPLOYEE",
	}
	employee1Roles := models.UserWithRoles{
		ID:              employee1.ID,
		FirstName:       employee1.FirstName,
		LastName:        employee1.LastName,
		EmailWork:       employee1.EmailWork,
		EmailPersonal:   *employee1.EmailPersonal,
		LoginID:         employee1.LoginID,
		IsActive:        true,
		ActiveStartDate: employee1.ActiveStartDate,
		Token:           "employee1_token_123",
		Roles:           "EMPLOYEE",
	}
	employee2Roles := models.UserWithRoles{
		ID:              employee2.ID,
		FirstName:       employee2.FirstName,
		LastName:        employee2.LastName,
		EmailWork:       employee2.EmailWork,
		EmailPersonal:   *employee2.EmailPersonal,
		LoginID:         employee2.LoginID,
		IsActive:        true,
		ActiveStartDate: employee2.ActiveStartDate,
		Token:           "employee2_token_123",
		Roles:           "EMPLOYEE",
	}
	userRoles := []models.UserWithRoles{adminRoles, employee1Roles, employee2Roles}
	for _, ur := range userRoles {
		if err := tx.Create(&ur).Error; err != nil {
			tx.Rollback()
			return fmt.Errorf("failed to create user roles for %s: %w", ur.LoginID, err)
		}
	}

	// Create UserRoles
	userRolesData := []models.UserRole{
		{
			UserID:   adminUser.ID,
			RoleID:   roleAdmin.ID,
			RoleName: roleAdmin.Name,
		},
		{
			UserID:   adminUser.ID,
			RoleID:   roleEmployee.ID,
			RoleName: roleEmployee.Name,
		},
		{
			UserID:   employee1.ID,
			RoleID:   roleEmployee.ID,
			RoleName: roleEmployee.Name,
		},
		{
			UserID:   employee2.ID,
			RoleID:   roleEmployee.ID,
			RoleName: roleEmployee.Name,
		},
	}
	for i := range userRolesData {
		userRolesData[i].ID = uuid.New().String()
		if err := tx.Create(&userRolesData[i]).Error; err != nil {
			tx.Rollback()
			return fmt.Errorf("failed to create user role for user %s: %w", userRolesData[i].UserID, err)
		}
	}

	// Create UserDepartments
	userDepartments := []models.UserDepartment{
		{
			UserID:         adminUser.ID,
			DepartmentID:   deptIT.ID,
			DepartmentName: deptIT.Name,
		},
		{
			UserID:         employee1.ID,
			DepartmentID:   deptIT.ID,
			DepartmentName: deptIT.Name,
		},
		{
			UserID:         employee2.ID,
			DepartmentID:   deptHR.ID,
			DepartmentName: deptHR.Name,
		},
	}
	for i := range userDepartments {
		userDepartments[i].ID = uuid.New().String()
		if err := tx.Create(&userDepartments[i]).Error; err != nil {
			tx.Rollback()
			return fmt.Errorf("failed to create user department for user %s: %w", userDepartments[i].UserID, err)
		}
	}

	// Create Employees
	employees := []models.Employee{
		{
			UserID:     adminUser.ID,
			Position:   "System Administrator",
			Department: deptIT.Name,
			HireDate:   time.Now().AddDate(-2, 0, 0),
		},
		{
			UserID:     employee1.ID,
			Position:   "Software Engineer",
			Department: deptIT.Name,
			HireDate:   time.Now().AddDate(-1, 0, 0),
			ManagerID:  ptrString(adminUser.ID),
		},
		{
			UserID:     employee2.ID,
			Position:   "HR Specialist",
			Department: deptHR.Name,
			HireDate:   time.Now().AddDate(-1, 0, 0),
			ManagerID:  ptrString(adminUser.ID),
		},
	}
	for i := range employees {
		employees[i].ID = uuid.New().String()
		if err := tx.Create(&employees[i]).Error; err != nil {
			tx.Rollback()
			return fmt.Errorf("failed to create employee for user %s: %w", employees[i].UserID, err)
		}
	}

	// Create Projects
	project1 := models.Project{
		Name:        "Website Redesign",
		Description: "Redesign company website",
		StartDate:   time.Now(),
		Status:      "Ongoing",
		OwnerID:     adminUser.ID,
	}
	project2 := models.Project{
		Name:        "Mobile App",
		Description: "Develop mobile application",
		StartDate:   time.Now().AddDate(0, -1, 0),
		EndDate:     ptrTime(time.Now()),
		Status:      "Completed",
		OwnerID:     adminUser.ID,
	}
	projects := []models.Project{project1, project2}
	for i := range projects {
		projects[i].ID = uuid.New().String()
		if err := tx.Create(&projects[i]).Error; err != nil {
			tx.Rollback()
			return fmt.Errorf("failed to create project %s: %w", projects[i].Name, err)
		}
	}

	// Create Project Members
	projectMembers := []models.ProjectMember{
		{
			ProjectID:     project1.ID,
			UserID:        employee1.ID,
			RoleInProject: "Developer",
		},
		{
			ProjectID:     project1.ID,
			UserID:        employee2.ID,
			RoleInProject: "Designer",
		},
		{
			ProjectID:     project2.ID,
			UserID:        employee1.ID,
			RoleInProject: "Developer",
		},
	}
	for i := range projectMembers {
		projectMembers[i].ID = uuid.New().String()
		if err := tx.Create(&projectMembers[i]).Error; err != nil {
			tx.Rollback()
			return fmt.Errorf("failed to create project member for user %s: %w", projectMembers[i].UserID, err)
		}
	}

	// Create Tasks
	tasks := []models.Task{
		{
			ProjectID:    project1.ID,
			Title:        "Implement Homepage",
			Description:  "Create responsive homepage",
			AssignedToID: employee1.ID,
			Status:       "Completed",
			Deadline:     ptrTime(time.Now().AddDate(0, 0, 7)),
			CompletedAt:  ptrTime(time.Now()),
		},
		{
			ProjectID:    project1.ID,
			Title:        "Design Mockups",
			Description:  "Create UI mockups",
			AssignedToID: employee2.ID,
			Status:       "In Progress",
			Deadline:     ptrTime(time.Now().AddDate(0, 0, 10)),
		},
		{
			ProjectID:    project2.ID,
			Title:        "Develop API",
			Description:  "Build backend API",
			AssignedToID: employee1.ID,
			Status:       "Completed",
			Deadline:     ptrTime(time.Now().AddDate(0, -1, 0)),
			CompletedAt:  ptrTime(time.Now().AddDate(0, -1, -1)),
		},
	}
	for i := range tasks {
		tasks[i].ID = uuid.New().String()
		if err := tx.Create(&tasks[i]).Error; err != nil {
			tx.Rollback()
			return fmt.Errorf("failed to create task %s: %w", tasks[i].Title, err)
		}
	}

	// Create TaskFeedback
	taskFeedbacks := []models.TaskFeedback{
		{
			TaskID:      tasks[0].ID,
			EvaluatorID: adminUser.ID,
			Comment:     "Great work on the homepage!",
			Rating:      5,
		},
		{
			TaskID:      tasks[2].ID,
			EvaluatorID: adminUser.ID,
			Comment:     "API integration was solid.",
			Rating:      4,
		},
	}
	for i := range taskFeedbacks {
		taskFeedbacks[i].ID = uuid.New().String()
		if err := tx.Create(&taskFeedbacks[i]).Error; err != nil {
			tx.Rollback()
			return fmt.Errorf("failed to create task feedback for task %s: %w", taskFeedbacks[i].TaskID, err)
		}
	}

	// Create KPIs
	kpi := models.KPI{
		Title:       "General Performance",
		Description: "Aggregated performance metrics based on tasks and projects",
		TargetValue: 100,
		Weight:      1.0,
	}
	kpi.ID = uuid.New().String()
	if err := tx.Create(&kpi).Error; err != nil {
		tx.Rollback()
		return fmt.Errorf("failed to create KPI %s: %w", kpi.Title, err)
	}

	// Create EmployeeKPIs
	employeeKPIs := []models.EmployeeKPI{
		{
			EmployeeID:          employee1.ID,
			TaskCompletionRate:  100.0, // 2/2 tasks completed
			TasksCompleted:      2,
			TasksAssigned:       2,
			ProjectContribution: 75.0, // Average of 50 (Ongoing, 2 members) + 100 (Completed, 1 member)
			ProjectsAssigned:    2,
			PerformanceScore:    90.0, // 0.6*100 + 0.4*75
			Status:              "Excellent",
			EvaluatedAt:         time.Now(),
		},
		{
			EmployeeID:          employee2.ID,
			TaskCompletionRate:  0.0, // 0/1 tasks completed
			TasksCompleted:      0,
			TasksAssigned:       1,
			ProjectContribution: 25.0, // 50 (Ongoing, 2 members)
			ProjectsAssigned:    1,
			PerformanceScore:    10.0, // 0.6*0 + 0.4*25
			Status:              "Needs Improvement",
			EvaluatedAt:         time.Now(),
		},
	}
	for i := range employeeKPIs {
		employeeKPIs[i].ID = uuid.New().String()
		if err := tx.Create(&employeeKPIs[i]).Error; err != nil {
			tx.Rollback()
			return fmt.Errorf("failed to create EmployeeKPI for user %s: %w", employeeKPIs[i].EmployeeID, err)
		}
	}

	// Commit transaction
	if err := tx.Commit().Error; err != nil {
		return fmt.Errorf("failed to commit transaction: %w", err)
	}

	fmt.Println("Database seeded successfully")
	return nil
}

// Helper functions for pointers
func ptrBool(b bool) *bool {
	return &b
}

func ptrTime(t time.Time) *time.Time {
	return &t
}

func ptrString(s string) *string {
	return &s
}