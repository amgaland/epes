package config

import (
	"database/sql"
	"fmt"
	"log"
	"os"

	"github.com/amgaland/epes/epes-back/models"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

var DB *gorm.DB
var sqlDB *sql.DB

func ConnectDatabase() {
	var err error
	dsn := fmt.Sprintf("postgres://%s:%s@%s:%s/%s?sslmode=disable",
		os.Getenv("DB_USER"),
		os.Getenv("DB_PASSWORD"),
		os.Getenv("DB_HOST"),
		os.Getenv("DB_PORT"),
		os.Getenv("DB_NAME"))
	DB, err = gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		log.Fatal("Failed to connect to the database:", err)
	}

	sqlDB, err = DB.DB()
	if err != nil {
		log.Fatal("Failed to get sql.DB from gorm.DB:", err)
	}

	if err = sqlDB.Ping(); err != nil {
		log.Fatal("Database connection is not active:", err)
	}
	DB.AutoMigrate(&models.User{})
	DB.AutoMigrate(&models.ActionType{})
	DB.AutoMigrate(&models.RolePermission{})
	DB.AutoMigrate(&models.Role{})
	DB.AutoMigrate(&models.UserRole{})
	DB.AutoMigrate(&models.Employee{})
	DB.AutoMigrate(&models.Project{})
	DB.AutoMigrate(&models.ProjectMember{})
	DB.AutoMigrate(&models.Task{})
	DB.AutoMigrate(&models.TaskFeedback{})
	DB.AutoMigrate(&models.EmployeeEvaluationReport{})
	DB.AutoMigrate(&models.Evaluation{})
	DB.AutoMigrate(&models.AIAnalysis{})
	DB.AutoMigrate(&models.Reward{})
	DB.AutoMigrate(&models.Competency{})
	DB.AutoMigrate(&models.EmployeeCompetencyRating{})
	DB.AutoMigrate(&models.EmployeeKPI{})
}
