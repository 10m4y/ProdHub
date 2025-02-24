package controllers

import (
	"context"
	"fmt"
	"net/http"
	"os"
	"time"

	"prodhub-backend/config"
	"prodhub-backend/models/mongo"
	"prodhub-backend/models/postgres"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v4"
	"github.com/google/uuid"
	"github.com/joho/godotenv"
	"go.mongodb.org/mongo-driver/bson"
	"golang.org/x/crypto/bcrypt"
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

// GetUser retrieves a user by ID
func GetUser(c *gin.Context) {
	userID := c.Param("id")

	var user postgres.User
	if err := config.PostgresDB.First(&user, "user_id = ?", userID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
		return
	}
	user.Password = ""
	c.JSON(http.StatusOK, user)
}

// UpdateUser updates a user's details
func UpdateUser(c *gin.Context) {
	userID := c.Param("id")
	currentUserID, _ := c.Get("userID")

	if userID != currentUserID {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	var user postgres.User
	if err := config.PostgresDB.First(&user, "user_id = ?", userID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
		return
	}

	type UpdateUserInput struct {
		Username string `json:"username"`
		Email    string `json:"email"`
	}
	var input UpdateUserInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if input.Username != "" {
		user.Username = input.Username
	}
	if input.Email != "" {
		user.Email = input.Email
	}
	user.UpdateAt = time.Now().Unix()

	if err := config.PostgresDB.Save(&user).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update user"})
		return
	}

	user.Password = ""
	c.JSON(http.StatusOK, user)
}

// GetUserRepos retrieves a user's repositories
func GetUserRepos(c *gin.Context) {
	userID := c.Param("id")

	var user postgres.User
	if err := config.PostgresDB.First(&user, "user_id = ?", userID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
		return
	}

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	var repos []mongo.Repo
	cursor, err := config.MongoDB.Database("prodhub").Collection("repos").Find(ctx, bson.M{"repoId": bson.M{"$in": user.RepoIDs}})
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get repos"})
		return
	}
	defer cursor.Close(ctx)
	if err := cursor.All(ctx, &repos); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to decode repos"})
		return
	}
	c.JSON(http.StatusOK, repos)
}

// LikeRepo allows a user to like a repository
func LikeRepo(c *gin.Context) {
	userID := c.Param("id")
	repoID := c.Param("repoId")

	var user postgres.User
	if err := config.PostgresDB.First(&user, "user_id = ?", userID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
		return
	}

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	var repo mongo.Repo
	if err := config.MongoDB.Database("prodhub").Collection("repos").FindOne(ctx, bson.M{"repoId": repoID}).Decode(&repo); err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Repo not found"})
		return
	}

	for _, id := range user.LikedRepos {
		if id == repoID {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Repo already liked"})
			return
		}
	}
	user.LikedRepos = append(user.LikedRepos, repoID)
	user.UpdateAt = time.Now().Unix()

	if err := config.PostgresDB.Save(&user).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to like repo"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Repo liked"})
}

// UnlikeRepo allows a user to unlike a repository
func UnlikeRepo(c *gin.Context) {
	userID := c.Param("id")
	repoID := c.Param("repoId")

	var user postgres.User
	if err := config.PostgresDB.First(&user, "user_id = ?", userID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
		return
	}

	for i, id := range user.LikedRepos {
		if id == repoID {
			user.LikedRepos = append(user.LikedRepos[:i], user.LikedRepos[i+1:]...)
			user.UpdateAt = time.Now().Unix()

			if err := config.PostgresDB.Save(&user).Error; err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to unlike repo"})
				return
			}
			c.JSON(http.StatusOK, gin.H{"message": "Repo unliked successfully"})
			return
		}
	}
	c.JSON(http.StatusBadRequest, gin.H{"error": "Repo not found in liked list"})
}

// CreateUser creates a new user
func CreateUser(c *gin.Context) {
	var input struct {
		Username string `json:"username" binding:"required"`
		Email    string `json:"email" binding:"required,email"`
		Password string `json:"password" binding:"required,min=6"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Hash the password
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(input.Password), bcrypt.DefaultCost)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to hash password"})
		return
	}

	var existingUser postgres.User
	if err := config.PostgresDB.Where("email = ?", input.Email).First(&existingUser).Error; err == nil {
		c.JSON(http.StatusConflict, gin.H{"error": "User with this email already exists"})
		return
	}

	userID := uuid.New().String()
	newUser := postgres.User{
		UserID:     userID,
		Email:      input.Email,
		Username:   input.Username,
		Password:   string(hashedPassword),
		RepoIDs:    []string{},
		LikedRepos: []string{},
		CreatedAt:  time.Now().Unix(),
		UpdateAt:   time.Now().Unix(),
	}

	if err := config.PostgresDB.Create(&newUser).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create user"})
		return
	}

	newUser.Password = "" // Don't return the password in the response
	c.JSON(http.StatusCreated, newUser)
}

// Login handles user authentication
func Login(c *gin.Context) {
	if err := loadEnv(); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error loading environment variables"})
		return
	}

	var input struct {
		Email    string `json:"email" binding:"required,email"`
		Password string `json:"password" binding:"required"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	var user postgres.User
	if err := config.PostgresDB.Where("email = ?", input.Email).First(&user).Error; err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid email or password"})
		return
	}

	if err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(input.Password)); err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid email or password"})
		return
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"userID": user.UserID,
		"exp":    time.Now().Add(time.Hour * 24).Unix(),
	})
	
	tokenString, err := token.SignedString([]byte(os.Getenv("JWT_SECRET")))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate token"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"token": tokenString,"user":user})
}