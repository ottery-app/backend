package api

import "github.com/gin-gonic/gin"

func HandleError(c *gin.Context, http int, err error) {
	if err != nil {
		c.JSON(http, gin.H{
			"error": err.Error(),
		})
	}
}

func HandleSuccess(c *gin.Context, http int, res gin.H) {
	c.JSON(http, res)
}
