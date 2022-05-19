package api

import (
	"fmt"
	"net/http"

	"github.com/gin-gonic/gin"
	mon "github.com/ottery-app/backend/mongo"
	"github.com/ottery-app/backend/sesh"
	"github.com/ottery-app/backend/types"
)

func Client(router *gin.Engine, mon mon.Mon) *gin.Engine {

	router.GET("client/search/user", func(c *gin.Context) {
		//get the token from the auth header
		token := c.GetHeader("Authorization")
		//get the id from the session
		id := sesh.GetSesh()[token].Email

		//check that the id is defined
		if id == "" {
			HandleError(c, http.StatusUnauthorized, fmt.Errorf("user not logged in"))
			return
		}

		//get the search param from the request url
		search := c.Query("search")

		res, err := mon.GoSearchUser(search)

		//remoove the id from the results
		for i := 0; i < len(res); i++ {
			if res[i].Email == id {
				res = append(res[:i], res[i+1:]...)
				i--
			}
		}

		if err != nil {
			HandleError(c, http.StatusExpectationFailed, err)
			return
		}

		HandleSuccess(c, http.StatusOK, gin.H{
			"users": res,
		})
	})

	router.PUT("client/user", func(c *gin.Context) {
		//get the token from the auth header
		token := c.GetHeader("Authorization")
		//get the id from the session
		id := sesh.GetSesh()[token].Email

		//check that the id is defined
		if id == "" {
			HandleError(c, http.StatusUnauthorized, fmt.Errorf("user not logged in"))
			return
		}

		//get the user from the request body
		var user types.User
		var err error

		user, err = mon.GoGetUser(id)
		fmt.Println(user)
		c.Bind(&user)
		fmt.Println(user)

		if err != nil {
			HandleError(c, http.StatusExpectationFailed, err)
			return
		}

		err = mon.GoUpdateUser(user)

		if err != nil {
			HandleError(c, http.StatusExpectationFailed, err)
			return
		}

		HandleSuccess(c, http.StatusOK, gin.H{
			"message": "success",
		})
	})

	router.GET("client/info", func(c *gin.Context) {
		//get the Authorization header
		token := c.GetHeader("Authorization")
		user := sesh.GetSesh()[token]

		userInfo, err := mon.GoGetUser(user.Email)
		HandleError(c, http.StatusUnauthorized, err)

		HandleSuccess(c, http.StatusOK, gin.H{
			"firstName": userInfo.FirstName,
			"lastName":  userInfo.LastName,
			"address":   userInfo.Address,
			"city":      userInfo.City,
			"state":     userInfo.State,
			"zip":       userInfo.Zip,
			"email":     user.Email,
		})
	})

	return router
}
