// controllers/upload.go
package controllers

import (
	"context"
	"fmt"
	"io"
	"mime/multipart"
	"time"
	"net/http"

	"github.com/google/uuid"
	"prodhub-backend/config"
	"github.com/gin-gonic/gin"
)

// UploadFile handles uploading a file to Firebase Storage
func UploadFile(c *gin.Context) {
	ctx, cancel := context.WithTimeout(context.Background(), time.Second*50)
	defer cancel()

	file,fileHeader,err := c.Request.FormFile("file")
	



	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error":"Failed to get file from request"+ err.Error()})
		return
	}
	defer file.Close()

	fileName := fileHeader.Filename
	var BucketName=config.BucketName
	fmt.Print("Uploadin in Bucket Name:",BucketName)
	if config.StorageClient == nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "storage bucket is not initialized"})
		return
	}


	// Generate unique object name
	objectName := fmt.Sprintf("%s/%s", uuid.New().String(), fileName)

	// Create a new bucket writer
	writer := config.StorageClient.Object(objectName).NewWriter(ctx)
	writer.ContentType = "application/octet-stream"

	// Copy the file data to the bucket
	bytesCopied, err := io.Copy(writer, file)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": fmt.Sprintf("failed to copy file data (bytes copied: %d): %v", bytesCopied, err),
		})
		return
	}

	// Close the writer
	if err := writer.Close(); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": fmt.Sprintf("failed to close writer: %v", err),
		})
		return
	}

	// Generate the public URL for the uploaded file
	fileURL := fmt.Sprintf("https://storage.googleapis.com/%s/%s", BucketName, objectName)

	c.JSON(http.StatusOK, gin.H{"url": fileURL})
}

func UploadFileUtil(file multipart.File, fileName string) (string, error) {
	ctx, cancel := context.WithTimeout(context.Background(), time.Second*50)
	defer cancel()

	if config.StorageClient == nil {
		return "", fmt.Errorf("storage bucket is not initialized")
	}

	// Generate unique object name
	objectName := fmt.Sprintf("%s/%s", uuid.New().String(), fileName)

	// Create a new bucket writer
	writer := config.StorageClient.Object(objectName).NewWriter(ctx)
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
	fileURL := fmt.Sprintf("https://storage.googleapis.com/%s/%s", config.BucketName, objectName)

	return fileURL, nil
}