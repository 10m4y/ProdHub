package controllers

import (
	"context"
	"fmt"
	"io"
	"mime/multipart"
	"time"

	// "cloud.google.com/go/storage"
	"github.com/google/uuid"

	"prodhub-backend/config"
)

// UploadFile handles uploading a file to Firebase Storage
func UploadFile(file multipart.File, fileName string, bucketName string) (string, error) {
	ctx, cancel := context.WithTimeout(context.Background(), time.Second*50)
	defer cancel()

	if config.StorageClient == nil {
        return "", fmt.Errorf("storage client is not initialized")
    }

	// Get bucket with error handling
	bucket, err := config.StorageClient.Bucket(bucketName)
	if err != nil {
		return "", fmt.Errorf("failed to get bucket: %v", err)
	}

	// Generate unique object name
	objectName := fmt.Sprintf("%s/%s", uuid.New().String(), fileName)
	
	// Create a new bucket writer
	writer := bucket.Object(objectName).NewWriter(ctx)
	
	writer.ContentType = "application/octet-stream"
	// Copy the file data to the bucket
	bytesCopied, err := io.Copy(writer, file)
    if err != nil {
        return "", fmt.Errorf("failed to copy file data (bytes copied: %d): %v", bytesCopied, err)
    }

	// Close the writer
	if err := writer.Close(); err != nil {
		return "", fmt.Errorf("failed to close writer: %v", err)
	}

	// Generate the public URL for the uploaded file
	fileURL := fmt.Sprintf("https://storage.googleapis.com/%s/%s", bucketName, objectName)

	return fileURL, nil
}