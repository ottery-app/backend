package api

import (
	"github.com/gin-gonic/gin"
)

func Api() {
	router := gin.Default()

	router = Auth(router)
	router = Guardian(router)

	router.Run()
}
