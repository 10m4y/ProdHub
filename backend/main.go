package main

import (
	"log"
	"prodhub-backend/config"
	"prodhub-backend/routes"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

func main() {
	// INITIALIZE GIN
	router := gin.Default()

	// CONFIGURE CORS
	router.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"*"},
		AllowMethods:     []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Accept"},
		AllowCredentials: true,
	}))

	// CONNECTING MONGODB
	log.Println("Connecting to mongodb")
	config.ConnectMongo()

	// CONNECTING POSTGRES
	log.Println("Connecting to postgres")
	config.ConnectPostgres()

	// Register Routes
	routes.RepoRoutes(router)
	routes.UserRoutes(router)

	log.Println("Server is running on port 8080")
	if err := router.Run(":8080"); err != nil {
		log.Fatal("Failed to start server: ", err)
	}
}
