package controllers

import (
    "context"
    "net/http"
    "time"
    "fmt"
    "log"

    "github.com/gin-gonic/gin"
    "go.mongodb.org/mongo-driver/bson"
    "prodhub-backend/config"
    "prodhub-backend/models/mongo"
    "prodhub-backend/models/postgres"
    "github.com/google/uuid"
)

// GetUser retrieves a user by ID
func GetUser(c *gin.Context) {
    userID := c.Param("id")
    log.Printf("Searching for user with ID: %s", userID)

    var user postgres.User
    if err := config.PostgresDB.First(&user, "user_id = ?", userID).Error; err != nil {
        log.Printf("Error finding user: %v", err)
        c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
        return
    }
    
    log.Printf("Found user: %+v", user)
    user.Password = ""
    c.JSON(http.StatusOK, user)
}

// UpdateUser updates a user's details
func UpdateUser(c *gin.Context) {
    userID := c.Param("id")
    // currentUserID, _ := c.Get("userID")

    // if userID != currentUserID {
    //     c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
    //     return
    // }

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
    fmt.Println(user.RepoIDs)

    ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
    defer cancel()
    
    var repos []mongo.Repo

    cursor, err := config.MongoDB.Database("prodhub").Collection("repos").Find(ctx, bson.M{"repoId": bson.M{"$in": user.RepoIDs}})
    if err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get repos"})
        return
    }
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

    var existingUser postgres.User
    if err := config.PostgresDB.Where("email = ?", input.Email).First(&existingUser).Error; err == nil {
        c.JSON(http.StatusConflict, gin.H{"error": "User with this email already exists"})
        return
    }

    // Generate a unique user_id
    userID := uuid.New().String()

    newUser := postgres.User{
        UserID:    userID, // Store the generated user_id
        Email:     input.Email,
        Username:  input.Username,
        Password:  input.Password, // You should hash the password before saving it in production
        RepoIDs:   []string{},
        LikedRepos: []string{},
        CreatedAt: time.Now().Unix(),
        UpdateAt:  time.Now().Unix(),
    }

    if err := config.PostgresDB.Create(&newUser).Error; err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create user"})
        return
    }

    newUser.Password = "" // Don't return the password
    c.JSON(http.StatusCreated, newUser)
}