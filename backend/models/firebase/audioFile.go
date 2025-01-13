package firebase

import "time"

// AudioFile represents an audio file in the repository
type AudioFile struct {
	AudioID     string    `firestore:"audioId"`     // Unique identifier for the audio file
	Name        string    `firestore:"name"`        // Name of the audio file
	Duration    int       `firestore:"duration"`    // Duration of the audio file in seconds
	Format      string    `firestore:"format"`      // File format (e.g., MP3, WAV)
	OwnerID     string    `firestore:"ownerId"`     // User ID of the owner
	CreatedAt   time.Time `firestore:"createdAt"`   // Timestamp when the file was uploaded
	DownloadURL string    `firestore:"downloadUrl"` // Firebase Storage URL for the audio file
}
