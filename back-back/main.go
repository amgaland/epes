package main

import (
	"log"
	"os"
	"strings"
	"time"

	"github.com/amgaland/epes/epes-back/config"
	"github.com/amgaland/epes/epes-back/routes"
	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
)

func main() {
    err := godotenv.Load()
    if err != nil {
        log.Println("Error loading .env file:", err)
    }

    log.Println("Initializing database connection...")
    config.ConnectDatabase()

    router := gin.Default()

    corsAllowedOrigins := os.Getenv("CORS_ALLOWED")
    if corsAllowedOrigins == "" {
        log.Println("CORS_ALLOWED not set, defaulting to localhost")
        corsAllowedOrigins = "http://localhost:3000"
    }

    router.Use(cors.New(cors.Config{
        AllowOrigins:     strings.Split(corsAllowedOrigins, ","),
        AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
        AllowHeaders:     []string{"Origin", "Content-Type", "Authorization"},
        ExposeHeaders:    []string{"Content-Length"},
        AllowCredentials: true,
        MaxAge:           12 * time.Hour,
    }))

    routes.RegisterRoutes(router)

    port := os.Getenv("PORT")
    if port == "" {
        port = "8088"
    }
    log.Printf("Server starting on port %s...", port)
    if err := router.Run(":" + port); err != nil {
        log.Fatalf("Server failed to start: %v", err)
    }
}