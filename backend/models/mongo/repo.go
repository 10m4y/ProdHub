package mongo

type Version struct{
	VersionID   string `bson:"versionId"`
	URL         string `bson:"url"`
	Changes     string `bson:"changes"`
	CreatedAt   int64  `bson:"createdAt"`
}

type Activity struct{
	Date        int64  `bson:"date"`
	Description string `bson:"description"`
}

type Repo struct{
	RepoID	  string `bson:"repoId"`
	OwnerId   string `bson:"ownerId"`
	Collaborators []string `bson:"collaborators"`
	Name	  string `bson:"name"`
	Description struct{
		BPM  int  `bson:"bpm"`
		Scale string `bson:"scale"`
		Genre string `bson:"genre"`
	}`bson:"description"`
	Activity []Activity `bson:"activity"`
	Versions []Version `bson:"versions"`
	CreatedAt int64 `bson:"createdAt"`
	UpdatedAt  int64 `bson:"updateAt"`
	Public     bool  `bson:"public"`
}