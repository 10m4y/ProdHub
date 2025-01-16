package config

import (
	"context"
	"log"
	"os"
	"time"
	

	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
	"github.com/joho/godotenv"
)

var MongoDB *mongo.Client
var RepoCollection *mongo.Collection
var CounterCollection *mongo.Collection

func ConnectMongo()error{

	godotenv.Load(".env")
	uri:=os.Getenv("MONGO_URI")
	log.Println(uri)
	clientOptions := options.Client().ApplyURI(uri)

	ctx,cancel:=context.WithTimeout(context.Background(),10*time.Second)
	defer cancel()
	client,err :=mongo.Connect(ctx,clientOptions)

	if err !=nil{
		log.Fatal("Failed to connect to mongoDB",err)
	}
	err=client.Ping(ctx,nil)
	if err!=nil{
		log.Fatal("Failed to ping MongoDB",err)
	}

	MongoDB=client
	RepoCollection = client.Database("prodhub").Collection("repos")
	database:=client.Database("prodhub")

	CounterCollection = database.Collection("counters")
	log.Println("Connected to MongoDB")
	return nil
}

func DisconnectMongo() {
    if err := MongoDB.Disconnect(context.Background()); err != nil {
        log.Printf("Error disconnecting MongoDB: %v", err)
    } else {
        log.Println("Disconnected from MongoDB")
    }
}
