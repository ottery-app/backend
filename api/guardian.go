package api

import (
	"github.com/gin-gonic/gin"
)

/**
 * this is the guardian branch of the api. it takes the gin router and adds the guardian routes to it it then returns the router
 */
func Guardian(router *gin.Engine) *gin.Engine {

	return router
}
