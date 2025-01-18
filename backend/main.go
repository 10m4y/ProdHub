package main

import (
	"log"
	// "net/http"

	"prodhub-backend/config"
	"prodhub-backend/routes"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	// "github.com/joho/godotenv"
	// "go.mongodb.org/mongo-driver/mongo"
	// "go.mongodb.org/mongo-driver/mongo/options"
	// "gorm.io/gorm"
	// "gorm.io/driver/postgres"
)

func main(){

	// INITIALIZE GIN
	router := gin.Default()


	// CONFIGURE CORS
    router.Use(cors.New(cors.Config{
        AllowOrigins:     []string{"http://localhost:3000"},
        AllowMethods:     []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"},
        AllowHeaders:     []string{"Origin", "Content-Type", "Accept"},
        AllowCredentials: true,
    }))

	//CONNECTING FIREBASE
	log.Println("Connecting to firebase")
	config.InitFirebase()

	// CONNECTING MONGODB
	log.Println("Connecting to mongodb")
	config.ConnectMongo()

	// CONNECTING POSTGRES
	log.Println("Connecting to postgres")
	config.ConnectPostgres()


	// http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request){
	// 	w.WriteHeader(http.StatusOK)
	// 	w.Write([]byte("Server is running, and database connections are successful!"))
	// })

	// routes.FileUploadRoutes(router)
	routes.RepoRoutes(router)
	routes.UserRoutes((router))

    log.Println("Server is running on port 8080")
    if err := router.Run(":8080"); err != nil {
        log.Fatal("Failed to start server: ", err)
    }
}