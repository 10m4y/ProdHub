package mongo

import (
	"go.mongodb.org/mongo-driver/bson/primitive"
	"time"
)

// VersionModel represents a specific version in a branch
type VersionModel struct {
	ID        primitive.ObjectID `bson:"_id,omitempty"`
	VersionID string             `bson:"versionId"` // Unique identifier for the version
	Name      string             `bson:"name"`      // Name of the version
	CreatedAt time.Time          `bson:"createdAt"` // Timestamp when the version was created
	FileURL   string             `bson:"fileUrl"`   // URL for the file associated with the version
}

// ActivityModel represents an action or change in a branch
type ActivityModel struct {
	ID         primitive.ObjectID `bson:"_id,omitempty"`
	ActivityID string             `bson:"activityId"` // Unique identifier for the activity
	Type       string             `bson:"type"`       // Type of activity (e.g., commit, merge)
	Message    string             `bson:"message"`    // Description of the activity
	AuthorID   string             `bson:"authorId"`   // User ID of the person who performed the activity
	Timestamp  time.Time          `bson:"timestamp"`  // Timestamp of the activity
}

// BranchModel represents a branch in a repository
type BranchModel struct {
	ID         primitive.ObjectID `bson:"_id,omitempty"`
	BranchID   string             `bson:"branchId"`   // Unique identifier for the branch
	Name       string             `bson:"name"`       // Name of the branch
	CreatedAt  time.Time          `bson:"createdAt"`  // Timestamp when the branch was created
	Versions   []VersionModel     `bson:"versions"`   // List of versions associated with the branch
	Activities []ActivityModel    `bson:"activities"` // List of activities in the branch
}
