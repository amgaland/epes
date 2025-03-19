package services

import (
	"errors"
	"net/http"

	"github.com/amgaland/epes/epes-back/config"
	"github.com/amgaland/epes/epes-back/models"
	"github.com/amgaland/epes/epes-back/utils"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func GetAllUsers(r *gin.Context) ([]models.User, error) {
	var users []models.User
	if err := config.DB.Find(&users).Error; err != nil {
		return nil, err
	}
	return users, nil
}

func CreateUser(user models.User, r *http.Request) (models.User, error) {
	existingUser := config.DB.Where("login_id = ?", user.LoginID).First(&models.User{})
	if existingUser.RowsAffected > 0 {
		return models.User{}, errors.New("user already exists")
	}

	hashedPassword, err := utils.HashPassword(user.Password)
	if err != nil {
		return models.User{}, err
	}
	user.Password = hashedPassword

	if err := config.DB.Create(&user).Error; err != nil {
		return models.User{}, err
	}
	return user, nil
}

func UpdateUser(id string, user models.User, r *http.Request) (models.User, error) {
	if err := config.DB.Model(&user).Where("id = ?", id).Updates(user).Error; err != nil {
		return models.User{}, err
	}
	return user, nil
}

func DeleteUser(id string, r *http.Request) error {
	if err := config.DB.Where("id = ?", id).Delete(&models.User{}).Error; err != nil {
		return err
	}
	return nil
}

func GetUserByID(id string, r *gin.Context) (*models.User, error) {


	var user models.User
	err := config.DB.Where("id = ?", id).First(&user).Error
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, nil
		}
		return nil, err
	}

	return &user, nil
}

func CheckLoginIDExists(loginID string, r *gin.Context) (bool, error) {
	var user models.User
	result := config.DB.Where("login_id = ?", loginID).First(&user)

	if result.Error != nil {
		if errors.Is(result.Error, gorm.ErrRecordNotFound) {
			return false, nil
		}
		return false, result.Error
	}

	return true, nil
}
