package helpers

import (
	"context"
	"fmt"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

// GetNextID generates the next auto-incremented ID for a given key (e.g., "repoId").
func GetNextID(ctx context.Context, collection *mongo.Collection, key string) (int, error) {
	var result struct {
		Value int `bson:"value"`
	}

	// Filter and Update definition
	filter := bson.M{"_id": key}
	update := bson.M{"$inc": bson.M{"value": 1}}

	// Options: Ensure it returns the updated document
	opts := options.FindOneAndUpdate().SetUpsert(true).SetReturnDocument(options.After)

	// Perform the update and get the updated value
	err := collection.FindOneAndUpdate(ctx, filter, update, opts).Decode(&result)
	if err != nil {
		return 0, fmt.Errorf("failed to generate ID for key %s: %v", key, err)
	}

	return result.Value, nil
}
