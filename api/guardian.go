package api

import (
	"fmt"
	"io/ioutil"

	"github.com/gin-gonic/gin"
)

/**
 * this is the guardian branch of the api. it takes the gin router and adds the guardian routes to it it then returns the router
 */
func Guardian(router *gin.Engine) *gin.Engine {

	//this gets a new child from the front end. it should have a token field and a types.Kid object
	router.POST("guardian/new/kid", func(c *gin.Context) {
		//bind the request to the kid object
		fmt.Println(c.GetHeader("Authorization"))
		body, _ := ioutil.ReadAll(c.Request.Body)
		println(string(body))
	})

	return router
}
