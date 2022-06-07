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

		id := sesh.GetSesh()[token].Username
		//check that the id is defined
		if id == "" {
			HandleError(c, http.StatusUnauthorized, fmt.Errorf("no user id"))
			return
		}

		kid.Owner = id
		kid.PrimaryGuardians = append(kid.PrimaryGuardians, id)
		kid.AuthorizedGuardians = append(kid.AuthorizedGuardians, id)

		childId, err := mon.GoChild.New(kid.FirstName, kid.MiddleName, kid.LastName, kid.Birthday, kid.Owner, kid.PrimaryGuardians, kid.AuthorizedGuardians)
		kid.Id = childId
		if err != nil {
			HandleError(c, http.StatusInternalServerError, err)
			return
		}

		err = mon.GoUser.AppendField(id, "kids", childId)
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
		id := sesh.GetSesh()[token].Username
		if id == "" {
			HandleError(c, http.StatusUnauthorized, fmt.Errorf("no user id"))
			return
		}

		user, err := mon.GoUser.Get(id)
		if err != nil {
			HandleError(c, http.StatusUnauthorized, err)
			return
		}

		//for eash kid in the user's kids field get that kid from the mongo db and store it in an array
		kids := []types.Kid{}
		for _, kid := range user.Kids {
			kidInfo, err := mon.GoChild.Get(kid)
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

	router.GET("children/:id", func(c *gin.Context) {
		token := c.GetHeader("Authorization")

		id := sesh.GetSesh()[token].Username
		if id == "" {
			HandleError(c, http.StatusUnauthorized, fmt.Errorf("no user id"))
			return
		}

		kidId := c.Param("id")
		kid, err := mon.GoChild.Get(kidId)
		if err != nil {
			HandleError(c, http.StatusUnauthorized, err)
			return
		}

		HandleSuccess(c, http.StatusOK, gin.H{
			"kid": kid,
		})
	})

	router.PUT("children/:id", func(c *gin.Context) {
		token := c.GetHeader("Authorization")

		id := sesh.GetSesh()[token].Username
		if id == "" {
			HandleError(c, http.StatusUnauthorized, fmt.Errorf("no user id"))
			return
		}

		kidId := c.Param("id")
		kid, err := mon.GoChild.Get(kidId)
		if err != nil {
			HandleError(c, http.StatusUnauthorized, err)
			return
		}

		var kidUpdate types.Kid
		c.Bind(&kidUpdate)
		kidUpdate.Id = kidId

		//check that the user is a primary guardian if not fail
		if !kid.IsPrimaryGuardian(id) {
			HandleError(c, http.StatusUnauthorized, fmt.Errorf("user is not a primary guardian"))
			return
		}

		err = mon.GoChild.Update(kidUpdate)

		if err != nil {
			HandleError(c, http.StatusUnauthorized, err)
			return
		}

		HandleSuccess(c, http.StatusOK, gin.H{
			"kid": kid,
		})
	})

	router.DELETE("children/:id", func(c *gin.Context) {
		token := c.GetHeader("Authorization")

		uid := sesh.GetSesh()[token].Username

		if uid == "" {
			HandleError(c, http.StatusUnauthorized, fmt.Errorf("no user id"))
			return
		}

		kidId := c.Param("id")

		kid, err := mon.GoChild.Get(kidId)
		if err != nil {
			HandleError(c, http.StatusUnauthorized, err)
			return
		}

		//check that the user is the owner
		if kid.IsOwner(uid) {
			HandleError(c, http.StatusUnauthorized, fmt.Errorf("user is not the owner"))
			return
		}

		err = mon.GoChild.Delete(kidId)
		if err != nil {
			HandleError(c, http.StatusUnauthorized, err)
			return
		}

		HandleSuccess(c, http.StatusOK, gin.H{
			"kid": kid,
		})
	})

	return router
}
