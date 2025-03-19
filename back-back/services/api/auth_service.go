package services

import (
	"crypto/sha1"
	"encoding/hex"
	"errors"
	"os"
	"time"

	"github.com/amgaland/epes/epes-back/config"
	"github.com/amgaland/epes/epes-back/models"
	"github.com/amgaland/epes/epes-back/utils"
	"gorm.io/gorm"
)

type UserWithPassword struct {
    models.UserWithRoles
    Password string `json:"password"`
    Roles    string `gorm:"-"`
}

func fetchUserByLoginID(loginID string) (models.UserWithRoles, string, error) {
    var userWithPassword UserWithPassword

    err := config.DB.Table("users").
        Select(`
            "users".id,
            "users".first_name,
            "users".last_name,
            "users".email_personal,
            "users".email_work,
            "users".login_id,
            "users".phone_number_personal,
            "users".phone_number_work,
            "users".is_active,
            "users".active_start_date,
            "users".active_end_date,
            "users".password,
            STRING_AGG(r.name, ',') AS roles
        `).
        Joins(`LEFT JOIN user_roles ur ON "users".id = ur.user_id`).
        Joins(`LEFT JOIN roles r ON ur.role_id = r.id`).
        Where(`"users".login_id = ?`, loginID).
        Group(`
            "users".id, 
            "users".first_name, 
            "users".last_name, 
            "users".email_personal, 
            "users".email_work, 
            "users".login_id, 
            "users".phone_number_personal, 
            "users".phone_number_work, 
            "users".is_active, 
            "users".active_start_date, 
            "users".active_end_date, 
            "users".password
        `).
        Scan(&userWithPassword).Error

    if err != nil {
        if errors.Is(err, gorm.ErrRecordNotFound) {
            return models.UserWithRoles{}, "", errors.New("user not found")
        }
        return models.UserWithRoles{}, "", err
    }

    return userWithPassword.UserWithRoles, userWithPassword.Password, nil
}

func generatePasswordHash(password string) (string, error) {
	privateKey := os.Getenv("PRIVATE_KEY")
	if privateKey == "" {
		return "", errors.New("private key not set in environment")
	}

	hash := sha1.New()
	hash.Write([]byte(password + privateKey))
	return hex.EncodeToString(hash.Sum(nil)), nil
}

func isUserActive(user models.UserWithRoles) bool {
	now := time.Now()
	if now.Before(user.ActiveStartDate) {
		return false
	}
	if user.ActiveEndDate != nil && now.After(*user.ActiveEndDate) {
		return false
	}
	return true
}

func SignIn(credentials models.LoginUser) (models.UserWithRoles, error) {
	user, storedPasswordHash, err := fetchUserByLoginID(credentials.LoginID)
	if err != nil {
		return models.UserWithRoles{}, errors.New("invalid user")
	}

	hashedPassword, err := generatePasswordHash(credentials.Password)
    println("pass is hererere",hashedPassword)
	if err != nil || hashedPassword != storedPasswordHash {
		return models.UserWithRoles{}, errors.New("invalid credentials")
	}

	if !isUserActive(user) {
		return models.UserWithRoles{}, errors.New("user is not active during this time period")
	}

	token, err := utils.GenerateToken(user.ID)
	if err != nil {
		return models.UserWithRoles{}, errors.New("couldn't generate token")
	}

	user.Token = token

	return user, nil
}
