package config

import(
    "log"
    pgDriver "gorm.io/driver/postgres"
    "gorm.io/gorm"
    "os"


    "github.com/joho/godotenv"
    pgModels "prodhub-backend/models/postgres"
)

var PostgresDB *gorm.DB



func ConnectPostgres(){

    godotenv.Load(".env")
    HOST:=os.Getenv("PG_HOST")
    USER:=os.Getenv("PG_USER")
    DBNAME:=os.Getenv("PG_DATABASE")
    PASSWORD:=os.Getenv("PG_PASSWORD")
    dsn :="host="+HOST+" user="+USER+" password="+PASSWORD+" dbname="+DBNAME+" port=5432 sslmode=disable TimeZone=Asia/Shanghai"
    var err error
    PostgresDB,err=gorm.Open(pgDriver.Open(dsn),&gorm.Config{})
    if err!=nil{
        log.Fatal("Failed to connect to Postgres",err)
    }
    log.Println("Connected to Postgres")


    err =runMigrations()
    if err!=nil{
        log.Fatal("Failed to run migrations",err)
    }
    log.Println("Database migrations completed successfully")
}
func runMigrations() error{
    return PostgresDB.AutoMigrate(&pgModels.User{})
}