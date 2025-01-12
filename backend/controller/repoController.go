package controllers

import (
	"context"
	"fmt"
	"net/http"
	"prodhub-backend/config"
	"prodhub-backend/models/mongo"
	"prodhub-backend/models/postgres"
    "prodhub-backend/helpers"
	"time"
    
    // "gorm.io/gorm/clause"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"go.mongodb.org/mongo-driver/bson"
	"gorm.io/gorm"
)

type RepoInput struct {
	OwnerID     string `json:"owner_id" binding:"required"`
	Name        string `json:"name" binding:"required,min=1,max=100"`
	BPM         int    `json:"bpm" binding:"required,min=20,max=300"`
	Scale       string `json:"scale" binding:"required"`
	Genre       string `json:"genre" binding:"required"`
}

func CreateRepo(c *gin.Context) {
	ctx := context.Background()
	var input RepoInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Start PostgreSQL transaction
	tx := config.PostgresDB.Begin()
	defer func() {
		if r := recover(); r != nil {
			tx.Rollback()
		}
	}()

	// Check if the user exists
	var user postgres.User
	if err := tx.Where("user_id = ?", input.OwnerID).First(&user).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			tx.Rollback()
			c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
		} else {
			tx.Rollback()
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Database error"})
		}
		return
	}

	// Generate a numeric RepoID
	repoID, err := helpers.GetNextID(ctx, config.CounterCollection, "repoId")
	if err != nil {
		tx.Rollback()
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate RepoID"})
		return
	}

	now := time.Now().Unix()

	repo := mongo.Repo{
		RepoID:        fmt.Sprintf("%d", repoID), // Use numeric RepoID as string
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
		Activity: []mongo.Activity{
			{
				Date:        now,
				Description: "Repository created",
			},
		},
		Versions:  []mongo.Version{},
		CreatedAt: now,
		UpdatedAt: now,
	}

	// Insert repo into MongoDB
	_, err = config.RepoCollection.InsertOne(ctx, repo)
	if err != nil {
		tx.Rollback()
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create repo in MongoDB"})
		return
	}

	// Update user's RepoIDs
	user.RepoIDs = append(user.RepoIDs, fmt.Sprintf("%d", repoID))
	if err := tx.Save(&user).Error; err != nil {
		_, deleteErr := config.RepoCollection.DeleteOne(ctx, bson.M{"repoId": repoID})
		if deleteErr != nil {
			fmt.Printf("Failed to delete repo from MongoDB after PostgreSQL update failure: %v\n", deleteErr)
		}
		tx.Rollback()
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update user data"})
		return
	}

	// Commit the PostgreSQL transaction
	if err := tx.Commit().Error; err != nil {
		_, deleteErr := config.RepoCollection.DeleteOne(ctx, bson.M{"repoId": repoID})
		if deleteErr != nil {
			fmt.Printf("Failed to delete repo from MongoDB after PostgreSQL commit failure: %v\n", deleteErr)
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to commit transaction"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"message": "Repository created successfully",
		"repo":    repo,
	})
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
