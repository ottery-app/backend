package api

import (
	"fmt"
	"net/http"

	"github.com/gin-gonic/gin"
)

/**
 * this is the guardian branch of the api. it takes the gin router and adds the guardian routes to it it then returns the router
 */
func Guardian(router *gin.Engine) *gin.Engine {

	router.POST("guardian/new/kid", func(c *gin.Context) {
		body := struct {
			Token string      `json:"token"`
			Kid   interface{} `json:"kid"`
		}{}

		c.Bind(&body)

		fmt.Println(body.Token)
		fmt.Println(body.Kid)

		fmt.Println("making new kid")
		HandleSuccess(c, http.StatusAccepted, gin.H{
			"name": "name",
		})
	})

	return router
}
