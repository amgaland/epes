package middleware

import (
	"encoding/base64"
	"errors"
	"net/http"
	"os"
	"strings"

	jwt "github.com/dgrijalva/jwt-go"
	"github.com/gin-gonic/gin"
)

func JWTAuthMiddleware(allowedRoles []string) gin.HandlerFunc {
	return func(c *gin.Context) {
		authHeader := c.GetHeader("Authorization")
		if authHeader == "" {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Authorization header missing"})
			c.Abort()
			return
		}

		tokenString := strings.Split(authHeader, "Bearer ")
		if len(tokenString) != 2 {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Malformed token"})
			c.Abort()
			return
		}

		token, err := jwt.Parse(tokenString[1], func(token *jwt.Token) (interface{}, error) {
			if _, ok := token.Method.(*jwt.SigningMethodRSA); !ok {
				return nil, errors.New("unexpected signing method")
			}
			publicKeyPEM, err := base64.StdEncoding.DecodeString(os.Getenv("JWT_PUBLIC_KEY"))
			if err != nil {
				return nil, err
			}
			publicKey, err := jwt.ParseRSAPublicKeyFromPEM([]byte(publicKeyPEM))
			if err != nil {
				return nil, err
			}
			return publicKey, nil
		})
		if err != nil || !token.Valid {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid token"})
			c.Abort()
			return
		}

		claims, ok := token.Claims.(jwt.MapClaims)
		if !ok {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid token claims"})
			c.Abort()
			return
		}

		user_id, ok := claims["user_id"].(string)
		if !ok {
			c.JSON(http.StatusForbidden, gin.H{"error": "user_id not found in token"})
			c.Abort()
			return
		}

		session_id, ok := claims["session_id"].(string)
		if !ok {
			c.JSON(http.StatusForbidden, gin.H{"error": "session_id not found in token"})
			c.Abort()
			return
		}

		email, ok := claims["email"].(string)
		if !ok {
			c.JSON(http.StatusForbidden, gin.H{"error": "email not found in token"})
			c.Abort()
			return
		}

		c.Request.Header.Set("user_id", user_id)
		c.Request.Header.Set("session_id", session_id)
		c.Request.Header.Set("email", email)

		roles, ok := claims["roles"].([]interface{})
		if !ok {
			c.JSON(http.StatusForbidden, gin.H{"error": "Roles not found in token"})
			c.Abort()
			return
		}

		roleSet := make(map[string]bool)
		for _, role := range roles {
			if roleStr, ok := role.(string); ok {
				roleSet[roleStr] = true
			}
		}

		roleAllowed := false
		for _, allowedRole := range allowedRoles {
			if roleSet[allowedRole] {
				roleAllowed = true
				break
			}
		}

		if !roleAllowed {
			c.JSON(http.StatusForbidden, gin.H{"error": "Access denied"})
			c.Abort()
			return
		}

		c.Next()
	}
}
