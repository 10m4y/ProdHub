package mongo

type Version struct {
	VersionID string `bson:"versionId"`
	URL       string `bson:"url"`
	Changes   string `bson:"changes"`
	CreatedAt int64  `bson:"createdAt"`
}

type Activity struct {
	Date        int64  `bson:"date"`
	Description string `bson:"description"`
}

type Branch struct {
	BranchID   string     `bson:"branchId"`
	Name       string     `bson:"name"`       // Name of the branch
	Versions   []Version  `bson:"versions"`   // Versions specific to this branch
	Activities []Activity `bson:"activities"` // Activities specific to this branch
	CreatedAt  int64      `bson:"createdAt"`  // Timestamp when branch was created
	IsDefault  bool       `bson:"isDefault"`  // Indicates if this is the default branch
}

type Repo struct {
	RepoID        string   `bson:"repoId"`
	OwnerId       string   `bson:"ownerId"`
	Collaborators []string `bson:"collaborators"`
	Name          string   `bson:"name"`
	Description   struct {
		BPM   int    `bson:"bpm"`
		Scale string `bson:"scale"`
		Genre string `bson:"genre"`
	} `bson:"description"`
	Activity  []Activity `bson:"activity"` // General repository activities
	Versions  []Version  `bson:"versions"` // General repository versions
	Branches  []Branch   `bson:"branches"` // List of branches
	CreatedAt int64      `bson:"createdAt"`
	UpdatedAt int64      `bson:"updatedAt"`
	Public     bool      `bson:"public"`
}