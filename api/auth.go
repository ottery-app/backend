package api

import (
	"fmt"
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
		var token string

		c.Bind(&login)

		user, err := mon.GoGetUser(login.Email)

		if security.CheckPasswordHash(login.Password, user.Password) {
			token = security.GenerateSecureToken()
		} else {
			err = fmt.Errorf("invalid password or username")
		}

		if err != nil {
			c.JSON(401, gin.H{
				"error": err.Error(),
			})
			return
		}

		//get the first occurance of the email in the tokens collection
		//if it exists, remove it
		err = mon.GoRemoveTokenToUserLink(login.Email)

		if err != nil {
			c.JSON(401, gin.H{
				"error": err.Error(),
			})
			return
		}

		//replace the token with the new one
		err = mon.GoLinkTokenToUser(token, login.Email)

		if err != nil {
			c.JSON(401, gin.H{
				"error": err.Error(),
			})
			return
		}

		c.JSON(200, gin.H{
			"token": token,
		})
	})

	router.POST("auth/activate", func(c *gin.Context) {
		activate := struct {
			Email          string `json:"email"`
			ActivationCode string `json:"activationCode"`
		}{}

		c.Bind(&activate)

		token, err := mon.GoActivateUser(activate.Email, activate.ActivationCode)

		if err != nil {
			c.JSON(401, gin.H{
				"error": err.Error(),
			})
			return
		}

		err = mon.GoLinkTokenToUser(token, activate.Email)

		if err != nil {
			c.JSON(401, gin.H{
				"error": err.Error(),
			})
			return
		}

		fmt.Println("new user activated " + activate.Email + " lets gooooooo!")
		c.JSON(200, gin.H{
			"token": token,
		})
	})

	router.POST("auth/register", func(c *gin.Context) {
		content := struct {
			Email    string `json:"email"`
			Password string `json:"password"`
			Name     string `json:"name"`
			Address  string `json:"address"`
		}{}

		c.Bind(&content)

		hashedPw, err := security.HashPassword(content.Password)

		if err != nil {
			panic(err)
		}

		code, err := mon.GoRegisterUser(content.Email, content.Name, content.Address, hashedPw)

		if err != nil {
			c.JSON(500, gin.H{
				"error": err.Error(),
			})
			return
		}

		mailer.Send(content.Email, "Activate your account", "Your activation code is "+code)

		//if the user is not registered after a certain amount of time remove them from the database
		go func(email string, code string) {
			time.Sleep(10 * time.Minute)
			user, _ := mon.GoGetUser(email)
			if user.ActivationCode == code {
				if mon.GoRemoveUser(email) != nil {
					fmt.Println("could not remove user: " + email)
				} else {
					fmt.Println("removed user: " + email)
				}
			}
		}(content.Email, code)
	})

	router.POST("auth/load", func(c *gin.Context) {
		res := struct {
			Token string `json:"token"`
		}{}

		c.Bind(&res)

		state, err := mon.GoLoadUser(res.Token)

		if err != nil {
			c.JSON(401, gin.H{
				"error": err.Error(),
			})
			return
		}

		c.JSON(200, gin.H{
			"state": state,
		})
	})

	return router
}
