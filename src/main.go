package main

import (
	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

func main() {
	//allow the server to accept requests from any origin
	router := gin.Default()
	router.Use(cors.Default())

	router.POST("/login", func(c *gin.Context) {
		c.JSON(200, gin.H{
			"user:": "lewibs",
			"token": "123456",
		})
	})

	router.Run()
}
