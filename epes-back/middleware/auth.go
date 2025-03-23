package middleware

import (
	"net/http"
	"strings"

	"github.com/amgaland/epes/epes-back/models"
	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v4"
)

func AuthMiddleware() gin.HandlerFunc {
    return func(c *gin.Context) {
        authHeader := c.GetHeader("Authorization")
        if authHeader == "" {
            c.JSON(http.StatusUnauthorized, models.ApiResponse{Error: "Missing Authorization header"})
            c.Abort()
            return
        }

        parts := strings.Split(authHeader, "Bearer ")
        if len(parts) != 2 {
            c.JSON(http.StatusUnauthorized, models.ApiResponse{Error: "Invalid Authorization format"})
            c.Abort()
            return
        }

        tokenStr := parts[1]
        token, err := jwt.Parse(tokenStr, func(token *jwt.Token) (interface{}, error) {
            return []byte("your-secret-key"), nil // Match your JWT secret
        })

        if err != nil || !token.Valid {
            c.JSON(http.StatusUnauthorized, models.ApiResponse{Error: "Invalid or expired token"})
            c.Abort()
            return
        }

        c.Next()
    }
}