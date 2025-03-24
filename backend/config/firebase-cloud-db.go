// config/firebase.go
package config

import (
	"context"
	"fmt"
	"log"
	"os"

	firebase "firebase.google.com/go"
	"cloud.google.com/go/storage"
	"google.golang.org/api/option"
	"github.com/joho/godotenv"
)

var (
	FirebaseApp  *firebase.App
	StorageClient *storage.BucketHandle
	BucketName string
)
func loadEnv() error {
	if err :=godotenv.Load(); err !=nil{
		return err
	}
	credsPath := os.Getenv("CRED_PATH")
	if credsPath == "" {
		return fmt.Errorf("CRED_PATH is not set in the environment variables")
	}

	return nil
}

// InitFirebase initializes the Firebase app and storage bucket
func InitFirebase() error {
	ctx := context.Background()

	// Using absolute path for credentials
	if err:= loadEnv(); err !=nil{
		panic(fmt.Sprintf("Error loading .env file: %s", err))
	}
	credsPath := os.Getenv("CRED_PATH")
	BucketName = os.Getenv("BUCKET_NAME")
	log.Println("Creds path:", credsPath)
	log.Println("Bucket name:", BucketName)

	opt := option.WithCredentialsFile(credsPath)

	// Initialize Firebase app
	app, err := firebase.NewApp(ctx, nil, opt)
	if err != nil {
		return fmt.Errorf("error initializing firebase app: %v", err)
	}
	FirebaseApp = app

	// Initialize Storage client
	client, err := app.Storage(ctx)
	if err != nil {
		return fmt.Errorf("error initializing storage client: %v", err)
	}


	// Get bucket handle - Bucket() returns (BucketHandle, error)
	bucket, err := client.Bucket(BucketName)
	if err != nil {
		return fmt.Errorf("error getting bucket handle: %v", err)
	}
	StorageClient = bucket
	

	log.Println("Firebase initialized successfully with bucket:", BucketName)
	return nil
}