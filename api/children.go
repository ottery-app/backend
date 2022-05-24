package api

import (
	"fmt"
	"net/http"

	"github.com/gin-gonic/gin"
	mon "github.com/ottery-app/backend/mongo"
	"github.com/ottery-app/backend/sesh"
	"github.com/ottery-app/backend/types"
)

func Children(router *gin.Engine, mon mon.Mon) *gin.Engine {
	//this gets a new child from the front end. it should have a token field and a types.Kid object
	router.POST("children", func(c *gin.Context) {
		var kid types.Kid
		//bind the request to the kid object
		token := c.GetHeader("Authorization")

		c.Bind(&kid)

		id := sesh.GetSesh()[token].Email
		//check that the id is defined
		if id == "" {
			HandleError(c, http.StatusUnauthorized, fmt.Errorf("no user id"))
			return
		}

		kid.Owner = id
		kid.PrimaryGuardians = append(kid.PrimaryGuardians, id)
		kid.AuthorizedGuardians = append(kid.AuthorizedGuardians, id)

		childId, err := mon.GoNewKid(kid.FirstName, kid.MiddleName, kid.LastName, kid.Birthday, kid.Owner, kid.PrimaryGuardians, kid.AuthorizedGuardians)
		kid.Id = childId
		if err != nil {
			HandleError(c, http.StatusInternalServerError, err)
			return
		}

		err = mon.GoAppendUserField(id, "kids", childId)
		if err != nil {
			HandleError(c, http.StatusInternalServerError, err)
			return
		}

		HandleSuccess(c, http.StatusAccepted, gin.H{
			"kid": kid,
		})
	})

	router.GET("children", func(c *gin.Context) {
		token := c.GetHeader("Authorization")
		id := sesh.GetSesh()[token].Email
		if id == "" {
			HandleError(c, http.StatusUnauthorized, fmt.Errorf("no user id"))
			return
		}

		user, err := mon.GoGetUser(id)
		if err != nil {
			HandleError(c, http.StatusUnauthorized, err)
			return
		}

		//for eash kid in the user's kids field get that kid from the mongo db and store it in an array
		kids := []types.Kid{}
		for _, kid := range user.Kids {
			kidInfo, err := mon.GoGetKid(kid)
			kidInfo.Id = kid
			if err != nil {
				HandleError(c, http.StatusUnauthorized, err)
				return
			}
			kids = append(kids, kidInfo)
		}

		HandleSuccess(c, http.StatusOK, gin.H{
			"children": kids,
		})

	})

	return router
}
