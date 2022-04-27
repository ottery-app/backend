package api

import (
	"fmt"

	"github.com/gin-gonic/gin"
)

func Auth(router *gin.Engine) *gin.Engine {

	router.POST("auth/login", func(c *gin.Context) {

		login := struct {
			Email    string `json:"email"`
			Password string `json:"password"`
		}{}

		c.Bind(&login)

		fmt.Println(GetUser(login.Email))
	})

	return router
}
