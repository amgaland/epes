package utils

import (
	"encoding/base64"
	"errors"
	"log"
	"os"
	"time"

	"github.com/amgaland/epes/epes-back/config"
	jwt "github.com/dgrijalva/jwt-go"
	"gorm.io/gorm"
)

func GenerateToken(ID string) (string, error) {
	var loginID string
	var userID string
	var phoneNumber string
	var roleNames []string
	var email string

	query := `
		SELECT u.id, r.name, u.login_id, u.phone_number_personal, u.email_work
		FROM "users" u
		JOIN "user_roles" ur ON u.id = ur.user_id
		JOIN "roles" r ON ur.role_id = r.id
		WHERE u.id = ?
	`

	rows, err := config.DB.Raw(query, ID).Rows()
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			return "", errors.New("user or roles not found")
		}
		return "", err
	}
	defer rows.Close()

	for rows.Next() {
		var roleName string
		if err := rows.Scan(&userID, &roleName, &loginID, &phoneNumber, &email); err != nil {
			return "", err
		}
		roleNames = append(roleNames, roleName)
	}

	if userID == "" {
		return "", errors.New("user not found")
	}

	sessionID := GenerateSessionId()
	if sessionID == "" {
		return "", errors.New("failed to generate session ID")
	}

	tokenExpiration := time.Now().Add(time.Hour * 24).Unix()

	claims := jwt.MapClaims{
		"login_id":   loginID,
		"user_id":    userID,
		"username":   phoneNumber,
		"email":      email,
		"session_id": sessionID,
		"exp":        tokenExpiration,
		"iat":        time.Now().Unix(),
		"roles":      roleNames,
	}

	token := jwt.NewWithClaims(jwt.SigningMethodRS256, claims)

	privateKeyData, err := base64.StdEncoding.DecodeString(os.Getenv("JWT_PRIVATE_KEY"))
	if err != nil {
		log.Fatalf("Error decoding private key: %v", err)
	}
	privateKey, err := jwt.ParseRSAPrivateKeyFromPEM(privateKeyData)
	if err != nil {
		log.Fatalf("Error parsing private key: %v", err)
	}
	tokenString, err := token.SignedString(privateKey)
	if err != nil {
		log.Fatalf("Error signing token: %v", err)
	}

	return tokenString, nil
}
