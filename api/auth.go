package api

import (
	"time"

	"github.com/gin-gonic/gin"
	"github.com/ottery-app/backend/mailer"
	mon "github.com/ottery-app/backend/mongo"
	"github.com/ottery-app/backend/security"
)

func Auth(router *gin.Engine, mon mon.Mon) *gin.Engine {

	router.POST("auth/login", func(c *gin.Context) {

		login := struct {
			Email    string `json:"email"`
			Password string `json:"password"`
		}{}

		c.Bind(&login)

		//returns the login
		c.JSON(200, login)
	})

	router.POST("auth/activate", func(c *gin.Context) {
		content := struct {
			Email    string `json:"email"`
			Password string `json:"password"`
		}{}

		c.Bind(&content)

		//check to see if the code given matches the user's code in the database
		//if it does then remove the code from the user's database
		//if it doesnt then return an error
	})

	router.POST("auth/register", func(c *gin.Context) {
		content := struct {
			Email    string `json:"email"`
			Password string `json:"password"`
			Name     string `json:"name"`
			Address  string `json:"address"`
		}{}

		c.Bind(&content)

		hashedPw, _ := security.HashPassword(content.Password)

		code := mon.GoRegister(content.Email, content.Name, content.Address, hashedPw)

		go func(email string, code string) {
			time.Sleep(10 * time.Minute)
			mon.GoRemove(email)
		}(content.Email, code)

		mailer.Send(content.Email, "Activate your account", "Your activation code is "+code)
	})

	return router
}
