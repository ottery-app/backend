package api

import (
	"fmt"
	"net/http"
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
		if err != nil {
			HandleError(c, http.StatusUnauthorized, err)
			return
		}

		if security.CheckPasswordHash(login.Password, storeduser.Password) {
			token = security.GenerateSecureToken()

			//adds the user to the session as the default guardian state
			sesh.GetSesh().Add(token, sesh.User{
				Email: storeduser.Email,
				State: sesh.DefaultState,
			})

			HandleSuccess(c, http.StatusOK, gin.H{
				"token": token,
				"state": sesh.DefaultState,
			})
		} else {
			HandleError(c, http.StatusUnauthorized, fmt.Errorf("username or password is incorrect"))
		}
	})

	router.PUT("auth/activate", func(c *gin.Context) {
		activate := struct {
			Email          string `json:"email"`
			ActivationCode string `json:"activationCode"`
		}{}

		c.Bind(&activate)

		err := mon.GoActivateUser(activate.Email, activate.ActivationCode)
		if err != nil {
			HandleError(c, http.StatusUnauthorized, err)
			return
		}

		token := security.GenerateSecureToken()

		sesh.GetSesh().Add(token, sesh.User{
			Email: activate.Email,
			State: "guardian",
		})

		HandleSuccess(c, http.StatusOK, gin.H{
			"token": token,
		})
	})

	router.POST("auth/register", func(c *gin.Context) {
		content := struct {
			Email     string `json:"email"`
			Password  string `json:"password"`
			FirstName string `json:"firstName"`
			LastName  string `json:"lastName"`
			Address   string `json:"address"`
			City      string `json:"city"`
			State     string `json:"state"`
			Zip       string `json:"zip"`
		}{}

		c.Bind(&content)

		hashedPw, err := security.HashPassword(content.Password)
		if err != nil {
			HandleError(c, http.StatusExpectationFailed, err)
			return
		}

		var code string
		code, err = mon.GoRegisterUser(content.Email, content.FirstName, content.LastName, content.Address, content.City, content.State, content.Zip, hashedPw)

		if err != nil {
			HandleError(c, http.StatusBadRequest, err)
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
			HandleError(c, http.StatusExpectationFailed, err)
			return
		}

		err = mailer.SendActivation(head.Email, code)

		if err != nil {
			HandleError(c, http.StatusExpectationFailed, err)
			return
		}
		//add the delayed user removal?
	})

	router.GET("auth/load", func(c *gin.Context) {
		token := c.GetHeader("Authorization")
		if sesh, ok := sesh.GetSesh()[token]; ok {
			HandleSuccess(c, http.StatusOK, gin.H{
				"state": sesh.State,
			})
			return
		} else {
			HandleError(c, http.StatusUnauthorized, fmt.Errorf("invalid token"))
			return
		}
	})

	router.DELETE("auth/logout", func(c *gin.Context) {
		token := c.GetHeader("Authorization")
		sesh.GetSesh().Delete(token)
		HandleSuccess(c, http.StatusOK, gin.H{})
	})

	return router
}
