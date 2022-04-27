package api

import (
	"fmt"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/ottery-app/backend/mailer"
	mon "github.com/ottery-app/backend/mongo"
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

		code := mon.GoRegister(content.Email, content.Name, content.Address, content.Password)

		go func(email string, code string) {
			time.Sleep(10 * time.Minute)
			fmt.Println("remove " + email)
			//get the user from the database
			//check to see if the user has the code
			//if they do then remove the user from the database
		}(content.Email, code)

		mailer.Send(content.Email, "Activate your account", "Your activation code is "+code)
	})

	return router
}
