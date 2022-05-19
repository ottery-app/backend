package api

import (
	"fmt"
	"net/http"

	"github.com/gin-gonic/gin"
	mon "github.com/ottery-app/backend/mongo"
	"github.com/ottery-app/backend/sesh"
	"github.com/ottery-app/backend/types"
)

/**
 * this is the guardian branch of the api. it takes the gin router and adds the guardian routes to it it then returns the router
 */
func Guardian(router *gin.Engine, mon mon.Mon) *gin.Engine {

	router.POST("guardian/vehicles", func(c *gin.Context) {
		var vehicle types.Vehicle
		c.Bind(&vehicle)
		//check that the auth header is in the sesh
		token := c.GetHeader("Authorization")
		if token == "" {
			HandleError(c, http.StatusUnauthorized, fmt.Errorf("no token provided"))
			return
		}
		//check that the token is in the sesh
		user := sesh.GetSesh()[token]

		if user.Email == "" {
			HandleError(c, http.StatusUnauthorized, fmt.Errorf("no user found"))
			return
		}

		id, err := mon.GoNewVehicle(user.Email, vehicle)
		if err != nil {
			HandleError(c, http.StatusInternalServerError, err)
			return
		}

		err = mon.GoAppendUserField(user.Email, "vehicles", id)

		if err != nil {
			HandleError(c, http.StatusInternalServerError, err)
			return
		}

		HandleSuccess(c, http.StatusOK, gin.H{
			"message": "vehicle added",
		})

	})

	router.GET("guardian/vehicles", func(c *gin.Context) {
		token := c.GetHeader("Authorization")
		if token == "" {
			HandleError(c, http.StatusUnauthorized, fmt.Errorf("no token provided"))
			return
		}
		userSesh := sesh.GetSesh()[token]
		if userSesh.Email == "" {
			HandleError(c, http.StatusUnauthorized, fmt.Errorf("no user found"))
			return
		}

		//get the user from the database
		user, err := mon.GoGetUser(userSesh.Email)
		if err != nil {
			HandleError(c, http.StatusInternalServerError, err)
			return
		}

		//for each vehicle in the user's vehicles, get the vehicle info
		vehicles := []types.Vehicle{}
		for _, vehicle := range user.Vehicles {
			vehicleInfo, err := mon.GoGetVehicle(vehicle)
			vehicleInfo.Id = vehicle
			if err != nil {
				HandleError(c, http.StatusUnauthorized, err)
				return
			}

			vehicles = append(vehicles, vehicleInfo)
		}
		HandleSuccess(c, http.StatusOK, gin.H{
			"vehicles": vehicles,
		})
	})

	//this gets a new child from the front end. it should have a token field and a types.Kid object
	router.POST("guardian/kids", func(c *gin.Context) {
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

	router.GET("guardian/kids", func(c *gin.Context) {
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
			"kids": kids,
		})

	})

	return router
}
