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
	"log"
    
    // "gorm.io/gorm/clause"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"go.mongodb.org/mongo-driver/bson"
	"gorm.io/gorm"
)

type RepoInput struct {
	// OwnerID     string `json:"owner_id" binding:"required"`
	Name        string `json:"name" binding:"required,min=1,max=100"`
	BPM         int    `json:"bpm" binding:"required,min=20,max=300"`
	Scale       string `json:"scale" binding:"required"`
	Genre       string `json:"genre" binding:"required"`
}

func CreateRepo(c *gin.Context) {
	ctx := context.Background()
	var input RepoInput

	// Extract user_id from the context
	userID, exists := c.Get("userId")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	// Bind JSON input (exclude OwnerID from input struct)
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
	if err := tx.Where("user_id = ?", userID).First(&user).Error; err != nil {
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
		OwnerId:       userID.(string),          // Automatically set OwnerID from context
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
	repoId := c.Param("repoId")

	file,header,err := c.Request.FormFile("file")
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "File not found"})
		return
	}
	defer file.Close()

	//UPLOAD FILE TO FIREBASE STORAGE
	bucketName := "prodhub-a4d9c.appspot.com"
	fileURL, err := UploadFile(file, header.Filename, bucketName)
if err != nil {
    log.Printf("Upload failed: %v", err)
    c.JSON(http.StatusInternalServerError, gin.H{
        "error": "Failed to upload file",
        "details": err.Error(),
    })
    return
}

	//Create version metadata
	version := mongo.Version{
		VersionID: uuid.New().String(),
		URL:	   fileURL,
		Changes:  c.PostForm("changes"),
		CreatedAt: time.Now().Unix(),
	}

	ctx,cancel :=context.WithTimeout(context.Background(),10*time.Second)
	defer cancel()

	filter := bson.M{"repoId": repoId}
	update := bson.M{"$push": bson.M{"versions": version}}

	_,err= config.RepoCollection.UpdateOne(ctx,filter,update)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to add version"})
		return
	}

	c.JSON(http.StatusOK,version)


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
	// I AM FETCHING USER_ID FROM THE CONTEXT
	// userID, _ := c.Get("userID")

    var repo mongo.Repo
    if err := config.RepoCollection.FindOne(ctx, bson.M{"repoId": repoID}).Decode(&repo); err != nil {
        c.JSON(http.StatusNotFound, gin.H{"error": "Repo not found"})
        return
    }

	// THIS IS FOR SAFETY SO USERS CAN'T ACCESS PRIVATE REPOS
	// if !repo.Public && repo.OwnerId != userID || !(helpers.Contains(repo.Collaborators,userID.(string))) {
	// 	c.JSON(http.StatusForbidden, gin.H{"error": "Access denied"})
	// }
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
	if repo.OwnerId != userID {
		c.JSON(http.StatusForbidden, gin.H{"error": "Only the owner can delete this repo"})
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


func GetRepoVersions(c *gin.Context) {
    repoID := c.Param("repoId")
	userID, _ := c.Get("userID")

    ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
    defer cancel()

    var repo mongo.Repo
    if err := config.RepoCollection.FindOne(ctx, bson.M{"repoId": repoID}).Decode(&repo); err != nil {
        c.JSON(http.StatusNotFound, gin.H{"error": "Repo not found"})
        return
    }
	if !repo.Public && repo.OwnerId != userID && !(helpers.Contains(repo.Collaborators, userID.(string))) {
		c.JSON(http.StatusForbidden, gin.H{"error": "Access denied"})
		return
	}

    c.JSON(http.StatusOK, repo.Versions)
}

func GetAllPublicRepos(c *gin.Context){

	ctx,cancel := context.WithTimeout(context.Background(),10*time.Second)
	defer cancel()

	filter :=bson.M{"public" : true}
	cursor,err := config.RepoCollection.Find(ctx,filter)
	if err!=nil{
		c.JSON(http.StatusInternalServerError,gin.H{"error":"Failed to fetch repos"})
		return
	}
	defer cursor.Close(ctx)

	var repos []mongo.Repo
	if err := cursor.All(ctx,&repos); err != nil {
		c.JSON(http.StatusInternalServerError,gin.H{"error":"Failed to decode repos"})
		return
	}

	c.JSON(http.StatusOK,repos)
}