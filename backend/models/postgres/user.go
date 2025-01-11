package postgres

import(
    "github.com/lib/pq"
)

type User struct {
    UserID     string         `gorm:"primaryKey;type:varchar(36);not null;unique" json:"user_id"`
    Email      string         `gorm:"unique;not null" json:"email"`
    Password   string         `gorm:"not null" json:"password"`
    Username   string         `gorm:"unique;not null" json:"username"`
    RepoIDs    pq.StringArray `gorm:"type:text[];default:'{}'" json:"repo_ids"`
    LikedRepos pq.StringArray `gorm:"type:text[];default:'{}'" json:"liked_repos"`
    CreatedAt  int64         `gorm:"autoCreateTime" json:"created_at"`
    UpdateAt   int64         `gorm:"autoUpdateTime" json:"updated_at"`
}

// TableName specifies the table name for GORM
func (User) TableName() string {
    return "users"
}

// BeforeCreate ensures arrays are initialized
func (u *User) BeforeCreate() error {
    if u.RepoIDs == nil {
        u.RepoIDs = make([]string, 0)
    }
    if u.LikedRepos == nil {
        u.LikedRepos = make([]string, 0)
    }
    return nil
}