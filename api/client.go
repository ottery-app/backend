package api

import (
	"net/http"

	"github.com/gin-gonic/gin"
	mon "github.com/ottery-app/backend/mongo"
	"github.com/ottery-app/backend/sesh"
)

func Client(router *gin.Engine, mon mon.Mon) *gin.Engine {

	router.POST("client/info", func(c *gin.Context) {
		body := struct {
			Token string `json:"token"`
		}{}

		c.Bind(&body)

		user := sesh.GetSesh()[body.Token]

		userInfo, err := mon.GoGetUser(user.Id)
		HandleError(c, http.StatusUnauthorized, err)

		HandleSuccess(c, http.StatusOK, gin.H{
			"name":    userInfo.Name,
			"address": userInfo.Address,
		})
	})

	return router
}
