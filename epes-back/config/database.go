package config

import (
	"fmt"
	"log"
	"os"

	"github.com/amgaland/epes/epes-back/models"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

var DB *gorm.DB

func ConnectDatabase() {
    dbHost := os.Getenv("DB_HOST")
    dbUser := os.Getenv("DB_USER")
    dbPassword := os.Getenv("DB_PASSWORD")
    dbName := os.Getenv("DB_NAME")
    dbPort := os.Getenv("DB_PORT")

    log.Printf("Attempting to connect with: host=%s, user=%s, dbname=%s, port=%s", 
        dbHost, dbUser, dbName, dbPort)

    dsn := fmt.Sprintf("host=%s user=%s password=%s dbname=%s port=%s sslmode=disable",
        dbHost, dbUser, dbPassword, dbName, dbPort)

    db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{})
    if err != nil {
        log.Fatalf("Failed to connect to database: %v", err)
    }

    // Test the connection
    sqlDB, err := db.DB()
    if err != nil {
        log.Fatalf("Failed to get database instance: %v", err)
    }
    if err := sqlDB.Ping(); err != nil {
        log.Fatalf("Failed to ping database: %v", err)
    }

    // Auto migrate models
    if err := db.AutoMigrate(&models.User{}); err != nil {
        log.Fatalf("Failed to auto migrate: %v", err)
    }

    DB = db
    log.Println("Database connected and migrated successfully")
}