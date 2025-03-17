package services

import (
	"fmt"
	"net/http"

	"github.com/amgaland/epes/epes-back/config"
	"github.com/amgaland/epes/epes-back/models"
)

func CreateUser(user models.User, r *http.Request) (models.User, error) {
    if config.DB == nil {
        return user, fmt.Errorf("database connection is not initialized")
    }
    if err := config.DB.Create(&user).Error; err != nil {
        return user, err
    }
    return user, nil
}