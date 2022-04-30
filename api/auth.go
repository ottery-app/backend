package api

import (
	"fmt"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/ottery-app/backend/mailer"
	mon "github.com/ottery-app/backend/mongo"
	"github.com/ottery-app/backend/security"
	"github.com/ottery-app/backend/sesh"
)

func Auth(router *gin.Engine, mon mon.Mon) *gin.Engine {

	router.POST("auth/login", func(c *gin.Context) {
		login := struct {
			Email    string `json:"email"`
			Password string `json:"password"`
		}{}
		var token string

		c.Bind(&login)

		storeduser, err := mon.GoGetUser(login.Email)

		if security.CheckPasswordHash(login.Password, storeduser.Password) {
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

		//adds the user to the session as the default guardian state
		sesh.GetSesh()[token] = sesh.User{
			Id:    storeduser.Id,
			State: "guardian",
		}

		c.JSON(200, gin.H{
			"token": token,
		})
	})

	router.PUT("auth/activate", func(c *gin.Context) {
		activate := struct {
			Email          string `json:"email"`
			ActivationCode string `json:"activationCode"`
		}{}

		c.Bind(&activate)

		err := mon.GoActivateUser(activate.Email, activate.ActivationCode)

		if err != nil {
			c.JSON(401, gin.H{
				"error": err.Error(),
			})
			return
		}

		//generate a token and add it to the session
		token := security.GenerateSecureToken()

		sesh.GetSesh()[token] = sesh.User{
			Id:    activate.Email,
			State: "guardian",
		}

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

		mailer.SendActivation(content.Email, code)

		//if the user is not registered after a certain amount of time remove them from the database
		go func(email string, code string) {
			time.Sleep(24 * time.Hour) //one day to authenticate before the user is removed
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

	router.POST("auth/resendActivation", func(c *gin.Context) {
		head := struct {
			Email string `json:"email"`
		}{}

		c.Bind(&head)

		code := security.RandomString()

		err := mon.GoUpdateUserField(head.Email, "activationCode", code)

		if err != nil {
			c.JSON(500, gin.H{
				"error": err.Error(),
			})
			return
		}

		mailer.SendActivation(head.Email, code)
	})

	router.POST("auth/load", func(c *gin.Context) {
		res := struct {
			Token string `json:"token"`
		}{}

		c.Bind(&res)

		if sesh, ok := sesh.GetSesh()[res.Token]; ok {
			c.JSON(200, gin.H{
				"state": sesh.State,
			})
		} else {
			c.JSON(401, gin.H{
				"error": "invalid token",
			})
		}
	})

	router.POST("auth/logout", func(c *gin.Context) {
		body := struct {
			Token string `json:"token"`
		}{}

		c.Bind(&body)

		sesh.GetSesh().Delete(body.Token)
	})

	return router
}
