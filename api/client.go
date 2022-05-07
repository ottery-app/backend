package api

import (
	"net/http"

	"github.com/gin-gonic/gin"
	mon "github.com/ottery-app/backend/mongo"
	"github.com/ottery-app/backend/sesh"
)

func Client(router *gin.Engine, mon mon.Mon) *gin.Engine {

	router.GET("client/info", func(c *gin.Context) {
		//get the Authorization header
		token := c.GetHeader("Authorization")
		user := sesh.GetSesh()[token]

		userInfo, err := mon.GoGetUser(user.Id)
		HandleError(c, http.StatusUnauthorized, err)

		HandleSuccess(c, http.StatusOK, gin.H{
			"firstName": userInfo.FirstName,
			"lastName":  userInfo.LastName,
			"address":   userInfo.Address,
			"city":      userInfo.City,
			"state":     userInfo.State,
			"zip":       userInfo.Zip,
			"email":     user.Id,
		})
	})

	return router
}
