package api

import (
	"fmt"
	"net/http"

	"github.com/gin-gonic/gin"
	mon "github.com/ottery-app/backend/mongo"
	"github.com/ottery-app/backend/sesh"
)

func Search(router *gin.Engine, mon mon.Mon) *gin.Engine {
	router.GET("search/user", func(c *gin.Context) {
		//get the token from the auth header
		token := c.GetHeader("Authorization")
		//get the id from the session
		id := sesh.GetSesh()[token].Username

		//check that the id is defined
		if id == "" {
			HandleError(c, http.StatusUnauthorized, fmt.Errorf("user not logged in"))
			return
		}

		fmt.Println("made it to line 25")

		//get the search param from the request url
		searchParam := c.Query("search")

		res, err := mon.GoSearchUser(searchParam)

		if err != nil {
			HandleError(c, http.StatusExpectationFailed, err)
			return
		}

		fmt.Println("made it to line 35")
		//remoove the id from the results
		for i := 0; i < len(res); i++ {
			if res[i].Username == id {
				res = append(res[:i], res[i+1:]...)
				i--
			}
		}

		fmt.Println("made it to line 41")

		if err != nil {
			HandleError(c, http.StatusExpectationFailed, err)
			return
		}

		HandleSuccess(c, http.StatusOK, gin.H{
			"users": res,
		})
	})

	return router
}
