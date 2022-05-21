package api

import (
	"time"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	mon "github.com/ottery-app/backend/mongo"
)

func Api() {
	mon := mon.Go()
	defer mon.Disconnect()

	router := gin.Default()
	router.Use(cors.New(cors.Config{
		AllowAllOrigins: true,
		AllowMethods:    []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowHeaders:    []string{"Authorization", "Origin", "Content-Type", "X-Requested-With"},
		MaxAge:          1 * time.Hour,
	}))

	router = Auth(router, mon)
	router = Children(router, mon)
	router = Vehicles(router, mon)
	router = Search(router, mon)
	router = User(router, mon)

	router.Run(":8080")
}
