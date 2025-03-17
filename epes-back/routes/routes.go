package routes

import (
	"github.com/amgaland/epes/epes-back/controllers"
	"github.com/gin-gonic/gin"
)

func RegisterRoutes(router *gin.Engine) {
    // Public routes
    router.GET("/health", controllers.HealthCheck)

    router.POST("/users", controllers.CreateUser)
}