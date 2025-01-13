package routes

import (
	controllers "prodhub-backend/controller"

	"github.com/gin-gonic/gin"
)

func RepoRoutes(router *gin.Engine) {
	repo := router.Group("/repo")
	{
		// Repository Routes
		repo.POST("/create", controllers.CreateRepo) // Create a new repository
		repo.GET("/:id", controllers.GetRepo)        // Get repository details
		repo.PUT("/:id", controllers.UpdateRepo)     // Update repository details
		repo.DELETE("/:id", controllers.DeleteRepo)  // Delete a repository

		// Branch Routes
		repo.POST("/:id/branch/create", controllers.CreateBranch)            // Create a new branch
		repo.PUT("/:id/branch/switch/:branchName", controllers.SwitchBranch) // Switch to a different branch
		repo.GET("/:id/branch/:branchName", controllers.GetBranch)           // Get details of a specific branch
		repo.GET("/:id/branches", controllers.GetBranch)                     // Get all branches
		repo.DELETE("/:id/branch/:branchName", controllers.DeleteBranch)     // Delete a specific branch
	}
}
