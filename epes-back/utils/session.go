package utils

import (
	"crypto/rand"
	"fmt"
)

func GenerateSessionId() string {
	uuid := make([]byte, 16)

	_, err := rand.Read(uuid)
	if err != nil {
		return ""
	}

	uuid[6] = (uuid[6] & 0x0F) | 0x40
	uuid[8] = (uuid[8] & 0x3F) | 0x80

	return fmt.Sprintf("%08x-%04x-%04x-%04x-%012x",
		uuid[0:4],
		uuid[4:6],
		uuid[6:8],
		uuid[8:10],
		uuid[10:16],
	)
}
