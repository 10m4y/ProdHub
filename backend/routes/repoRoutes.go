package routes

import(

	"github.com/gin-gonic/gin"

	"prodhub-backend/controller"
)

func RepoRoutes(router *gin.Engine){
	repo := router.Group("/repo")
	{
		repo.GET("/",controllers.GetAllPublicRepos)
		repo.POST("/create",controllers.CreateRepo)
		repo.GET("/:id",controllers.GetRepo)
		// UPDATE REPO FUNCTION NEED TO BE IMPLEMENTED
		// repo.PUT("/:id",controllers.UpdateRepo) 
		repo.DELETE("/:id",controllers.DeleteRepo)
		repo.POST("/upload/:id",controllers.AddVersion)
		repo.GET("history/:id",controllers.GetRepoVersions)
	}
}