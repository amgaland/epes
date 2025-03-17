package utils

import (
	"crypto/sha1"
	"encoding/hex"
	"errors"
	"os"
)

func HashPassword(password string) (string, error) {
	privateKey := os.Getenv("PRIVATE_KEY")
	if privateKey == "" {
		return "", errors.New("private key not set in environment")
	}

	h := sha1.New()
	h.Write([]byte(password + privateKey))
	return hex.EncodeToString(h.Sum(nil)), nil
}
