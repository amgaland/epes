package services

import (
	"errors"

	"github.com/amgaland/epes/epes-back/config"
	"github.com/amgaland/epes/epes-back/models"
)

func GetAllFeedback(employeeID string) ([]models.Feedback, error) {
	var feedbacks []models.Feedback
	query := config.DB.Model(&models.Feedback{})

	if employeeID != "" {
		query = query.Where("employee_id = ?", employeeID)
	}

	err := query.Order("created_at desc").Find(&feedbacks).Error
	return feedbacks, err
}

func GetFeedbackByID(id string) (*models.Feedback, error) {
	var feedback models.Feedback
	err := config.DB.First(&feedback, "id = ?", id).Error
	return &feedback, err
}

func CreateFeedback(feedback models.Feedback) (models.Feedback, error) {
	feedback.CreatedAt = feedback.CreatedAt.UTC()
	err := config.DB.Create(&feedback).Error
	return feedback, err
}

func UpdateFeedback(id string, input models.Feedback) (models.Feedback, error) {
	var feedback models.Feedback
	if err := config.DB.First(&feedback, "id = ?", id).Error; err != nil {
		return models.Feedback{}, errors.New("feedback not found")
	}

	// Update fields (you can limit fields to be updated if needed)
	feedback.Text = input.Text
	feedback.Author = input.Author

	if err := config.DB.Save(&feedback).Error; err != nil {
		return models.Feedback{}, err
	}
	return feedback, nil
}


func DeleteFeedback(id string) error {
	var feedback models.Feedback
	if err := config.DB.First(&feedback, "id = ?", id).Error; err != nil {
		return errors.New("feedback not found")
	}
	return config.DB.Delete(&feedback).Error
}
