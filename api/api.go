package api

import (
	"github.com/gin-gonic/gin"
	mon "github.com/ottery-app/backend/mongo"
)

func Api() {
	mon := mon.Go()

	router := gin.Default()
	router = Auth(router, mon)
	router = Guardian(router)

	router.Run()
}
