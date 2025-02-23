package controllers

import (
	"context"
	"errors"
	"fmt"
	"net/http"
	"prodhub-backend/config"
	"prodhub-backend/models/mongo"
	"prodhub-backend/models/postgres"
	"time"
	"log"
    
    // "gorm.io/gorm/clause"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"go.mongodb.org/mongo-driver/bson"
	"gorm.io/gorm"
	"prodhub-backend/helpers"
)

// Structs for Inputs
type RepoInput struct {
	// OwnerID     string `json:"owner_id" binding:"required"`
	Name        string `json:"name" binding:"required,min=1,max=100"`
	BPM         int    `json:"bpm" binding:"required,min=20,max=300"`
	Scale       string `json:"scale" binding:"required"`
	Genre       string `json:"genre" binding:"required"`
}

type UpdateRepoInput struct {
	Name  *string `json:"name" binding:"omitempty,min=1,max=100"`
	BPM   *int    `json:"bpm" binding:"omitempty,min=20,max=300"`
	Scale *string `json:"scale"`
	Genre *string `json:"genre"`
}

type BranchInput struct {
	Name         string `json:"name" binding:"required,min=1,max=50"`
	SourceBranch string `json:"sourceBranch"`
}

// Error responses
var (
	ErrRepoNotFound   = errors.New("repository not found")
	ErrBranchNotFound = errors.New("branch not found")
	ErrUserNotFound   = errors.New("user not found")
	ErrInvalidInput   = errors.New("invalid input")
	ErrDatabaseOp     = errors.New("database operation failed")
)

// Helper function to send error response
func sendErrorResponse(c *gin.Context, statusCode int, err error) {
	c.JSON(statusCode, gin.H{"error": err.Error()})
}

// Create a Repository
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
		sendErrorResponse(c, http.StatusBadRequest, ErrInvalidInput)
		return
	}

	// Start PostgreSQL transaction
	tx := config.PostgresDB.Begin()
	defer func() {
		if r := recover(); r != nil {
			tx.Rollback()
		}
	}()

	// Check if user exists
	var user postgres.User
	if err := tx.Where("user_id = ?", userID).First(&user).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			tx.Rollback()
			c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
		} else {
			sendErrorResponse(c, http.StatusInternalServerError, ErrDatabaseOp)
		}
		return
	}
	

	// Generate a numeric RepoID
	repoID, err := helpers.GetNextID(ctx, config.CounterCollection, "repoId")
	if err != nil {
		tx.Rollback()
		sendErrorResponse(c, http.StatusInternalServerError, errors.New("failed to generate RepoID"))
		return
	}

	now := time.Now().Unix()
	repoIDStr := fmt.Sprintf("%d", repoID)

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
		Branches: []mongo.Branch{
			{
				BranchID:   uuid.New().String(),
				Name:       "main",
				CreatedAt:  now,
				Versions:   []mongo.Version{},
				Activities: []mongo.Activity{},
			},
		},
		CreatedAt: now,
		UpdatedAt: now,
	}

	// Insert repo into MongoDB
	if _, err := config.RepoCollection.InsertOne(ctx, repo); err != nil {
		tx.Rollback()
		sendErrorResponse(c, http.StatusInternalServerError, errors.New("failed to create repo in MongoDB"))
		return
	}

	// Update user's RepoIDs
	user.RepoIDs = append(user.RepoIDs, repoIDStr)
	if err := tx.Save(&user).Error; err != nil {
		if _, deleteErr := config.RepoCollection.DeleteOne(ctx, bson.M{"repoId": repoIDStr}); deleteErr != nil {
			fmt.Printf("Failed to delete repo from MongoDB after PostgreSQL update failure: %v\n", deleteErr)
		}
		tx.Rollback()
		sendErrorResponse(c, http.StatusInternalServerError, errors.New("failed to update user data"))
		return
	}

	if err := tx.Commit().Error; err != nil {
		if _, deleteErr := config.RepoCollection.DeleteOne(ctx, bson.M{"repoId": repoIDStr}); deleteErr != nil {
			fmt.Printf("Failed to delete repo from MongoDB after PostgreSQL commit failure: %v\n", deleteErr)
		}
		sendErrorResponse(c, http.StatusInternalServerError, errors.New("failed to commit transaction"))
		return
	}

	c.JSON(http.StatusCreated, repo)
}

// Update a Repository
func UpdateRepo(c *gin.Context) {
	ctx := context.Background()
	repoID := c.Param("id")

	var input UpdateRepoInput
	if err := c.ShouldBindJSON(&input); err != nil {
		sendErrorResponse(c, http.StatusBadRequest, ErrInvalidInput)
		return
	}
	

	// Check if repo exists
	var repo mongo.Repo
	if err := config.RepoCollection.FindOne(ctx, bson.M{"repoId": repoID}).Decode(&repo); err != nil {
		sendErrorResponse(c, http.StatusNotFound, ErrRepoNotFound)
		return
	}

	updateData := bson.M{"updatedAt": time.Now().Unix()}
	if input.Name != nil {
		updateData["name"] = *input.Name
	}
	if input.BPM != nil {
		updateData["description.bpm"] = *input.BPM
	}
	if input.Scale != nil {
		updateData["description.scale"] = *input.Scale
	}
	if input.Genre != nil {
		updateData["description.genre"] = *input.Genre
	}

	filter := bson.M{"repoId": repoID}
	update := bson.M{"$set": updateData}

	if _, err := config.RepoCollection.UpdateOne(ctx, filter, update); err != nil {
		sendErrorResponse(c, http.StatusInternalServerError, ErrDatabaseOp)
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Repository updated successfully"})
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

// Get Repository
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

// Delete Repository
func DeleteRepo(c *gin.Context) {
	ctx := context.Background()
	repoID := c.Param("id")

    var repo mongo.Repo
    if err := config.RepoCollection.FindOne(ctx, bson.M{"repoId": repoID}).Decode(&repo); err != nil {
        c.JSON(http.StatusNotFound, gin.H{"error": "Repo not found"})
        return
    }
	// if repo.OwnerId != userID {
	// 	c.JSON(http.StatusForbidden, gin.H{"error": "Only the owner can delete this repo"})
	// 	return
	// }

	if _, err := config.RepoCollection.DeleteOne(ctx, bson.M{"repoId": repoID}); err != nil {
		sendErrorResponse(c, http.StatusInternalServerError, ErrDatabaseOp)
		return
	}

	var user postgres.User
	if err := config.PostgresDB.First(&user, "id = ?", repo.OwnerId).Error; err != nil {
		c.JSON(http.StatusOK, gin.H{
			"message": "Repository deleted successfully, but failed to update user data",
		})
		return
	}

	newRepoIDs := make([]string, 0)
	for _, id := range user.RepoIDs {
		if id != repoID {
			newRepoIDs = append(newRepoIDs, id)
		}
	}
	user.RepoIDs = newRepoIDs

	if err := config.PostgresDB.Save(&user).Error; err != nil {
		c.JSON(http.StatusOK, gin.H{
			"message": "Repository deleted successfully, but failed to update user data",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Repository deleted successfully"})
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
// Create a Branch
func CreateBranch(c *gin.Context) {
	ctx := context.Background()
	repoID := c.Param("id")

	var input BranchInput
	if err := c.ShouldBindJSON(&input); err != nil {
		sendErrorResponse(c, http.StatusBadRequest, ErrInvalidInput)
		return
	}

	var repo mongo.Repo
	if err := config.RepoCollection.FindOne(ctx, bson.M{"repoId": repoID}).Decode(&repo); err != nil {
		sendErrorResponse(c, http.StatusNotFound, ErrRepoNotFound)
		return
	}

	for _, branch := range repo.Branches {
		if branch.Name == input.Name {
			sendErrorResponse(c, http.StatusBadRequest, errors.New("branch name already exists"))
			return
		}
	}

	newBranchID := uuid.New().String()
	newBranch := mongo.Branch{
		BranchID:   newBranchID,
		Name:       input.Name,
		CreatedAt:  time.Now().Unix(),
		Versions:   []mongo.Version{},
		Activities: []mongo.Activity{},
	}

	if input.SourceBranch != "" {
		sourceBranchFound := false
		for _, branch := range repo.Branches {
			if branch.Name == input.SourceBranch {
				newBranch.Versions = branch.Versions
				newBranch.Activities = branch.Activities
				sourceBranchFound = true
				break
			}
		}
		if !sourceBranchFound {
			sendErrorResponse(c, http.StatusNotFound, ErrBranchNotFound)
			return
		}
	}

	filter := bson.M{"repoId": repoID}
	update := bson.M{
		"$push": bson.M{"branches": newBranch},
		"$set":  bson.M{"updatedAt": time.Now().Unix()},
	}

	if _, err := config.RepoCollection.UpdateOne(ctx, filter, update); err != nil {
		sendErrorResponse(c, http.StatusInternalServerError, ErrDatabaseOp)
		return
	}
	c.JSON(http.StatusCreated, newBranch)
}

// Get Branch
func GetBranch(c *gin.Context) {
	ctx := context.Background()
	repoID := c.Param("id")
	branchName := c.Param("branchName")

	var repo mongo.Repo
	if err := config.RepoCollection.FindOne(ctx, bson.M{"repoId": repoID}).Decode(&repo); err != nil {
		sendErrorResponse(c, http.StatusNotFound, ErrRepoNotFound)
		return
	}

	for _, branch := range repo.Branches {
		if branch.Name == branchName {
			c.JSON(http.StatusOK, branch)
			return
		}
	}

	sendErrorResponse(c, http.StatusNotFound, ErrBranchNotFound)
}

// Switch Branch
func SwitchBranch(c *gin.Context) {
	ctx := context.Background()
	repoID := c.Param("id")
	branchName := c.Param("branchName")

	var repo mongo.Repo
	if err := config.RepoCollection.FindOne(ctx, bson.M{"repoId": repoID}).Decode(&repo); err != nil {
		sendErrorResponse(c, http.StatusNotFound, ErrRepoNotFound)
		return
	}

	for _, branch := range repo.Branches {
		if branch.Name == branchName {
			c.JSON(http.StatusOK, branch)
			return
		}
	}

	sendErrorResponse(c, http.StatusNotFound, ErrBranchNotFound)
}

// Delete Branch
func DeleteBranch(c *gin.Context) {
	ctx := context.Background()
	repoID := c.Param("id")
	branchName := c.Param("branchName")

	if branchName == "main" {
		sendErrorResponse(c, http.StatusBadRequest, errors.New("cannot delete main branch"))
		return
	}

	var repo mongo.Repo
	if err := config.RepoCollection.FindOne(ctx, bson.M{"repoId": repoID}).Decode(&repo); err != nil {
		sendErrorResponse(c, http.StatusNotFound, ErrRepoNotFound)
		return
	}

	// Check if branch exists
	branchExists := false
	for _, branch := range repo.Branches {
		if branch.Name == branchName {
			branchExists = true
			break
		}
	}

	if !branchExists {
		sendErrorResponse(c, http.StatusNotFound, ErrBranchNotFound)
		return
	}

	filter := bson.M{"repoId": repoID}
	update := bson.M{
		"$pull": bson.M{"branches": bson.M{"name": branchName}},
		"$set":  bson.M{"updatedAt": time.Now().Unix()},
	}

	if _, err := config.RepoCollection.UpdateOne(ctx, filter, update); err != nil {
		sendErrorResponse(c, http.StatusInternalServerError, ErrDatabaseOp)
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Branch deleted successfully"})
}