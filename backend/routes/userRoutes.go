package routes

import (
	controllers "prodhub-backend/controller"
	"prodhub-backend/middleware"

	"github.com/gin-gonic/gin"
)

func UserRoutes(router *gin.Engine) {
	// Auth routes
	auth := router.Group("/auth")
	{
		auth.POST("/login", controllers.Login)
	}

	// User routes
	user := router.Group("/user")
	{
		// Public routes
		user.POST("/create", controllers.CreateUser)

		// Protected routes
		user.Use(middleware.Authentication())
		{
			user.GET("/:id", controllers.GetUser)
			user.PUT("/:id", controllers.UpdateUser)
			user.GET("/:id/repos", controllers.GetUserRepos)
			user.POST("/:id/repos/:repoId/like", controllers.LikeRepo)
			user.POST("/:id/repos/:repoId/unlike", controllers.UnlikeRepo)
		}
	}
}
