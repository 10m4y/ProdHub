package config

import (
	"context"
	"fmt"
	"os"
	"firebase.google.com/go"
	"firebase.google.com/go/storage"
	"google.golang.org/api/option"
	"log"
)

var (
	FirebaseApp   *firebase.App
	StorageClient *storage.Client
)

// InitFirebase initializes the Firebase app and storage client
func InitFirebase() error {
	ctx := context.Background()
	
	// Using absolute path for credentials
	credsPath := "D:\\Projects\\ProdHub\\backend\\prodhub-a4d9c-firebase-adminsdk-wwumf-9975dd04be.json"
	
	// Verify credentials file exists
	if _, err := os.Stat(credsPath); err != nil {
		return fmt.Errorf("firebase credentials file not found: %v", err)
	}
	
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
	StorageClient = client

	log.Println("Firebase initialized successfully")


	return nil
}