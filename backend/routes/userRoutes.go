package routes

import(

	"github.com/gin-gonic/gin"
	"prodhub-backend/controller"
)

func UserRoutes(router *gin.Engine){
	user :=router.Group("/user")
	{
		user.GET("/:id",controllers.GetUser)
		user.PUT("/:id",controllers.UpdateUser)
		user.GET("/:id/repos",controllers.GetUserRepos)
		user.POST("create",controllers.CreateUser)
	}
}