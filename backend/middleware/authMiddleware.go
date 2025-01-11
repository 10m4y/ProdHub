package middleware

import (
	"fmt"
	"net/http"
	"os"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v4"
	"github.com/joho/godotenv"
)

// Load JWT secret from environment variables and ensure it's set
func loadEnv() error {
	if err := godotenv.Load(); err != nil {
		return err
	}

	// Ensure JWT_SECRET is set in the environment variables
	jwtSecret := os.Getenv("JWT_SECRET")
	if jwtSecret == "" {
		return fmt.Errorf("JWT_SECRET is not set in the environment variables")
	}
	return nil
}

// Authentication validates JWT tokens in the Authorization header
func Authentication() gin.HandlerFunc {
	// Load environment variables
	if err := loadEnv(); err != nil {
		panic(fmt.Sprintf("Error loading .env file: %s", err))
	}

	// Get the JWT secret from the environment
	jwtSecret := []byte(os.Getenv("JWT_SECRET"))

	return func(c *gin.Context) {
		// Get the Authorization header
		authorizationHeader := c.GetHeader("Authorization")
		if authorizationHeader == "" || !strings.HasPrefix(authorizationHeader, "Bearer ") {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Authorization header missing or malformed"})
			c.Abort()
			return
		}

		// Extract the token string
		tokenString := strings.TrimPrefix(authorizationHeader, "Bearer ")

		// Parse and validate the token
		token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
			// Ensure the token's signing method matches the expected method
			if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
				return nil, jwt.NewValidationError("unexpected signing method", jwt.ValidationErrorSignatureInvalid)
			}
			return jwtSecret, nil
		})

		// Handle token parsing errors or invalid token
		if err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid or expired token", "details": err.Error()})
			c.Abort()
			return
		}

		// Check if token is valid
		if !token.Valid {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid or expired token"})
			c.Abort()
			return
		}

		// Extract claims from the token
		if claims, ok := token.Claims.(jwt.MapClaims); ok {
			// Extract the `userID` claim and set it in the context
			if userID, exists := claims["userID"]; exists {
				c.Set("userID", userID)
			} else {
				c.JSON(http.StatusUnauthorized, gin.H{"error": "User ID claim missing in token"})
				c.Abort()
				return
			}
		} else {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid token claims"})
			c.Abort()
			return
		}

		// Proceed to the next handler
		c.Next()
	}
}
