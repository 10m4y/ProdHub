package postgres

type User struct{
	UserID  int   `gorm:"primaryKey:autoIncrement"`
	Email   string `gorm:"unique;not null"`
	Password string `gorm:"not null"`
	Username string `gorm:"unique;not null"`
	RepoIDs  []string  `gorm:"type:text[]"`
	LikedRepos []string `gorm:"type:text[]"`
	CreatedAt int64 `gorm:"autoCreateTime"`
	UpdateAt  int64 `gorm:"autoUpdateTime"`
}