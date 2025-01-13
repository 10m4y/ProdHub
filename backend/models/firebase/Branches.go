package firebase

import "time"

// Version represents a specific version in a branch
type Version struct {
	VersionID string    `firestore:"versionId"` // Unique identifier for the version
	Name      string    `firestore:"name"`      // Name of the version
	CreatedAt time.Time `firestore:"createdAt"` // Timestamp when the version was created
	FileURL   string    `firestore:"fileUrl"`   // URL for the file associated with the version
}

// Activity represents an action or change in a branch
type Activity struct {
	ActivityID string    `firestore:"activityId"` // Unique identifier for the activity
	Type       string    `firestore:"type"`       // Type of activity (e.g., commit, merge)
	Message    string    `firestore:"message"`    // Description of the activity
	AuthorID   string    `firestore:"authorId"`   // User ID of the person who performed the activity
	Timestamp  time.Time `firestore:"timestamp"`  // Timestamp of the activity
}

// Branch represents a branch in a repository
type Branch struct {
	BranchID   string        `firestore:"branchId"`   // Unique identifier for the branch
	Name       string        `firestore:"name"`       // Name of the branch
	CreatedAt  time.Time     `firestore:"createdAt"`  // Timestamp when the branch was created
	Versions   []Version     `firestore:"versions"`   // List of versions associated with the branch
	Activities []Activity    `firestore:"activities"` // List of activities in the branch
}
