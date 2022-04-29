package security

import (
	"crypto/rand"
	"encoding/hex"
	random "math/rand"
	"time"

	"golang.org/x/crypto/bcrypt"
)

func GenerateSecureToken() string {
	b := make([]byte, 42)
	if _, err := rand.Read(b); err != nil {
		return ""
	}
	return hex.EncodeToString(b)
}

func HashPassword(password string) (string, error) {
	bytes, err := bcrypt.GenerateFromPassword([]byte(password), 14)
	return string(bytes), err
}

func CheckPasswordHash(password, hash string) bool {
	err := bcrypt.CompareHashAndPassword([]byte(hash), []byte(password))
	return err == nil
}

func RandomString() string {
	random.Seed(time.Now().Unix())
	b := make([]byte, 5)
	charset := "randomsturgillnoises01234567890123456789"

	for i := range b {
		b[i] = charset[random.Intn(len(charset))]
	}

	return string(b)
}
