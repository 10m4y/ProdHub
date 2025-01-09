package controllers

import (
    "context"
    "net/http"
    "prodhub-backend/config"
    "prodhub-backend/models/mongo"
    "prodhub-backend/models/postgres"
    "time"

    "github.com/gin-gonic/gin"
    "github.com/google/uuid"
    "go.mongodb.org/mongo-driver/bson"
)

type RepoInput struct {
    Name  string `json:"name" binding:"required"`
    BPM   int    `json:"bpm" binding:"required"`
    Scale string `json:"scale" binding:"required"`
    Genre string `json:"genre" binding:"required"`
	OwnerID string `json:"ownerId" binding:"required"`
}

func CreateRepo(c *gin.Context) {
    ctx := context.Background()
    var input RepoInput
    if err := c.ShouldBindJSON(&input); err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
        return
    }

    // userID, exists := c.Get("userID")
    // if !exists {
    //     c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthenticated"})
    //     return
    // }

    repoID := uuid.New().String()
    now := time.Now().Unix()

    repo := mongo.Repo{
        RepoID:        repoID,
        OwnerId:       input.OwnerID,
        Collaborators: []string{},
        Name:          input.Name,
        Description: struct {
            BPM   int    `bson:"bpm"`
            Scale string `bson:"scale"`
            Genre string `bson:"genre"`
        }{
            BPM:   input.BPM,
            Scale: input.Scale,
            Genre: input.Genre,
        },
        Activity:  []mongo.Activity{},
        Versions:  []mongo.Version{},
        CreatedAt: now,
        UpdatedAt: now,
    }

    if _, err := config.RepoCollection.InsertOne(ctx, repo); err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create repo"})
        return
    }

    var user postgres.User
    if err := config.PostgresDB.First(&user, "id = ?", input.OwnerID).Error; err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update user data"})
        return
    }

    user.RepoIDs = append(user.RepoIDs, repoID)

    if err := config.PostgresDB.Save(&user).Error; err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update user data"})
        return
    }

    c.JSON(http.StatusCreated, repo)
}

func AddVersion(c *gin.Context) {
    ctx := context.Background()
    repoID := c.Param("id")

    var version mongo.Version
    if err := c.ShouldBindJSON(&version); err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
        return
    }
    version.VersionID = uuid.New().String()
    version.CreatedAt = time.Now().Unix()

    filter := bson.M{"repoId": repoID}
    update := bson.M{"$push": bson.M{"versions": version}}

    if _, err := config.RepoCollection.UpdateOne(ctx, filter, update); err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to add version"})
        return
    }
    c.JSON(http.StatusCreated, version)
}

func AddActivity(c *gin.Context) {
    ctx := context.Background()
    repoID := c.Param("id")

    var activity mongo.Activity
    if err := c.ShouldBindJSON(&activity); err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
        return
    }
    activity.Date = time.Now().Unix()

    filter := bson.M{"repoId": repoID}
    update := bson.M{"$push": bson.M{"activity": activity}}

    if _, err := config.RepoCollection.UpdateOne(ctx, filter, update); err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to add activity"})
        return
    }
    c.JSON(http.StatusOK, activity)
}

func GetRepo(c *gin.Context) {
    ctx := context.Background()
    repoID := c.Param("id")

    var repo mongo.Repo
    if err := config.RepoCollection.FindOne(ctx, bson.M{"repoId": repoID}).Decode(&repo); err != nil {
        c.JSON(http.StatusNotFound, gin.H{"error": "Repo not found"})
        return
    }
    c.JSON(http.StatusOK, repo)
}

func DeleteRepo(c *gin.Context) {
    ctx := context.Background()
    repoID := c.Param("id")
    userID, _ := c.Get("userID")

    var repo mongo.Repo
    if err := config.RepoCollection.FindOne(ctx, bson.M{"repoId": repoID}).Decode(&repo); err != nil {
        c.JSON(http.StatusNotFound, gin.H{"error": "Repo not found"})
        return
    }

    if _, err := config.RepoCollection.DeleteOne(ctx, bson.M{"repoId": repoID}); err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete repo"})
        return
    }

    var user postgres.User
    if err := config.PostgresDB.First(&user, "id = ?", userID).Error; err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update user data"})
        return
    }

    for i, id := range user.RepoIDs {
        if id == repoID {
            user.RepoIDs = append(user.RepoIDs[:i], user.RepoIDs[i+1:]...)
            break
        }
    }
    if err := config.PostgresDB.Save(&user).Error; err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update user data"})
        return
    }
    c.JSON(http.StatusOK, gin.H{"message": "Repo deleted successfully"})
}
