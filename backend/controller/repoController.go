package controllers

import (
	"context"
	"errors"
	"net/http"
	"prodhub-backend/config"
	"prodhub-backend/models/mongo"
	"prodhub-backend/models/postgres"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"go.mongodb.org/mongo-driver/bson"
)

// Structs for Inputs
type RepoInput struct {
	Name    string `json:"name" binding:"required,min=1,max=100"`
	BPM     int    `json:"bpm" binding:"required,min=20,max=300"`
	Scale   string `json:"scale" binding:"required"`
	Genre   string `json:"genre" binding:"required"`
	OwnerID string `json:"ownerId" binding:"required,uuid"`
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
	if err := c.ShouldBindJSON(&input); err != nil {
		sendErrorResponse(c, http.StatusBadRequest, ErrInvalidInput)
		return
	}

	// Check if user exists
	var user postgres.User
	if err := config.PostgresDB.First(&user, "id = ?", input.OwnerID).Error; err != nil {
		sendErrorResponse(c, http.StatusNotFound, ErrUserNotFound)
		return
	}

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
		Branches:  []mongo.Branch{},
		CreatedAt: now,
		UpdatedAt: now,
	}

	// Create default "main" branch
	mainBranch := mongo.Branch{
		BranchID:   uuid.New().String(),
		Name:       "main",
		CreatedAt:  now,
		Versions:   []mongo.Version{},
		Activities: []mongo.Activity{},
	}
	repo.Branches = append(repo.Branches, mainBranch)

	if _, err := config.RepoCollection.InsertOne(ctx, repo); err != nil {
		sendErrorResponse(c, http.StatusInternalServerError, ErrDatabaseOp)
		return
	}

	user.RepoIDs = append(user.RepoIDs, repoID)
	if err := config.PostgresDB.Save(&user).Error; err != nil {
		// Rollback MongoDB insertion if Postgres update fails
		config.RepoCollection.DeleteOne(ctx, bson.M{"repoId": repoID})
		sendErrorResponse(c, http.StatusInternalServerError, ErrDatabaseOp)
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

// Get Repository
func GetRepo(c *gin.Context) {
	ctx := context.Background()
	repoID := c.Param("id")

	var repo mongo.Repo
	if err := config.RepoCollection.FindOne(ctx, bson.M{"repoId": repoID}).Decode(&repo); err != nil {
		sendErrorResponse(c, http.StatusNotFound, ErrRepoNotFound)
		return
	}
	c.JSON(http.StatusOK, repo)
}

// Delete Repository
func DeleteRepo(c *gin.Context) {
	ctx := context.Background()
	repoID := c.Param("id")

	// Check if repo exists and get owner ID
	var repo mongo.Repo
	if err := config.RepoCollection.FindOne(ctx, bson.M{"repoId": repoID}).Decode(&repo); err != nil {
		sendErrorResponse(c, http.StatusNotFound, ErrRepoNotFound)
		return
	}

	// Delete repo from MongoDB
	if _, err := config.RepoCollection.DeleteOne(ctx, bson.M{"repoId": repoID}); err != nil {
		sendErrorResponse(c, http.StatusInternalServerError, ErrDatabaseOp)
		return
	}

	// Update user's repoIDs in Postgres
	var user postgres.User
	if err := config.PostgresDB.First(&user, "id = ?", repo.OwnerId).Error; err != nil {
		// Log this error but don't return since repo is already deleted
		c.JSON(http.StatusOK, gin.H{
			"message": "Repository deleted successfully, but failed to update user data",
		})
		return
	}

	// Remove repoID from user's repoIDs
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

// Create a Branch
func CreateBranch(c *gin.Context) {
	ctx := context.Background()
	repoID := c.Param("id")

	var input BranchInput
	if err := c.ShouldBindJSON(&input); err != nil {
		sendErrorResponse(c, http.StatusBadRequest, ErrInvalidInput)
		return
	}

	// Check if repo exists and get current branches
	var repo mongo.Repo
	if err := config.RepoCollection.FindOne(ctx, bson.M{"repoId": repoID}).Decode(&repo); err != nil {
		sendErrorResponse(c, http.StatusNotFound, ErrRepoNotFound)
		return
	}

	// Check if branch name already exists
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

	// Prevent deletion of main branch
	if branchName == "main" {
		sendErrorResponse(c, http.StatusBadRequest, errors.New("cannot delete main branch"))
		return
	}

	// Check if repo exists
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
