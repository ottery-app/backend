package main

import (
	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

func main() {
	//allow the server to accept requests from any origin
	router := gin.Default()
	router.Use(cors.Default())

	router.POST("/user/load", func(c *gin.Context) {
		load := struct {
			Token string `json:"token"`
		}{}

		c.BindJSON(&load)

		creds := struct {
			Token string `json:"token"`
			State string `json:"state"`
		}{
			Token: load.Token,
			State: "guardian",
		}

		c.IndentedJSON(200, creds)
	})

	router.POST("/user/login", func(c *gin.Context) {
		login := struct {
			Username string `json:"username"`
			Password string `json:"password"`
		}{}

		c.BindJSON(&login)

		creds := struct {
			Username string `json:"username"`
			Token    string `json:"token"`
			State    string `json:"state"`
		}{
			Username: login.Username,
			Token:    login.Password,
			State:    "guardian",
		}

		c.IndentedJSON(200, creds)
	})

	router.Run()
}
