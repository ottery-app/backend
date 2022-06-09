package api

import (
	"fmt"
	"net/http"

	"github.com/gin-gonic/gin"
	mon "github.com/ottery-app/backend/mongo"
	"github.com/ottery-app/backend/sesh"
	"github.com/ottery-app/backend/types"
)

func Vehicles(router *gin.Engine, mon mon.Mon) *gin.Engine {

	router.POST("vehicles", func(c *gin.Context) {
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

		if user.Username == "" {
			HandleError(c, http.StatusUnauthorized, fmt.Errorf("no user found"))
			return
		}

		id, err := mon.GoVehicle.New(user.Username, vehicle)
		if err != nil {
			HandleError(c, http.StatusInternalServerError, err)
			return
		}

		err = mon.GoUser.AppendField(user.Username, "vehicles", id)
		if err != nil {
			HandleError(c, http.StatusInternalServerError, err)
			return
		}

		HandleSuccess(c, http.StatusAccepted, gin.H{
			"message": "vehicle added",
		})

	})

	router.GET("vehicles", func(c *gin.Context) {
		token := c.GetHeader("Authorization")
		if token == "" {
			HandleError(c, http.StatusUnauthorized, fmt.Errorf("no token provided"))
			return
		}
		userSesh := sesh.GetSesh()[token]
		if userSesh.Username == "" {
			HandleError(c, http.StatusUnauthorized, fmt.Errorf("no user found"))
			return
		}

		//get the user from the database
		user, err := mon.GoUser.Get(userSesh.Username)
		if err != nil {
			HandleError(c, http.StatusInternalServerError, err)
			return
		}

		//for each vehicle in the user's vehicles, get the vehicle info
		vehicles := []types.Vehicle{}
		for _, vehicle := range user.Vehicles {
			vehicleInfo, err := mon.GoVehicle.Get(vehicle)
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

	router.GET("vehicles/:id", func(c *gin.Context) {
		token := c.GetHeader("Authorization")
		if token == "" {
			HandleError(c, http.StatusUnauthorized, fmt.Errorf("no token provided"))
			return
		}
		userSesh := sesh.GetSesh()[token]
		if userSesh.Username == "" {
			HandleError(c, http.StatusUnauthorized, fmt.Errorf("no user found"))
			return
		}

		//get the user from the database
		user, err := mon.GoUser.Get(userSesh.Username)
		if err != nil {
			HandleError(c, http.StatusInternalServerError, err)
			return
		}

		//check that the vehicle is in the user's vehicles
		vehicleId := c.Param("id")

		//check to see if the user has the vehicle
		if !user.ContainsVehicle(vehicleId) {
			HandleError(c, http.StatusUnauthorized, fmt.Errorf("user does not have vehicle"))
			return
		}

		//get the vehicle from the database
		vehicle, err := mon.GoVehicle.Get(vehicleId)
		if err != nil {
			HandleError(c, http.StatusInternalServerError, err)
			return
		}

		HandleSuccess(c, http.StatusOK, gin.H{
			"vehicle": vehicle,
		})
	})

	router.PUT("vehicles/:id", func(c *gin.Context) {
		var vehicle types.Vehicle
		c.Bind(&vehicle)

		token := c.GetHeader("Authorization")
		if token == "" {
			HandleError(c, http.StatusUnauthorized, fmt.Errorf("no token provided"))
			return
		}

		userSesh := sesh.GetSesh()[token]
		if userSesh.Username == "" {
			HandleError(c, http.StatusUnauthorized, fmt.Errorf("no user found"))
			return
		}

		//get the user from the database and check if the user has the vehicle
		user, err := mon.GoUser.Get(userSesh.Username)
		if err != nil {
			HandleError(c, http.StatusInternalServerError, err)
			return
		}

		//check that the vehicle is in the user's vehicles
		vehicleId := c.Param("id")

		//check to see if the user has the vehicle
		if !user.ContainsVehicle(vehicleId) {
			HandleError(c, http.StatusUnauthorized, fmt.Errorf("user does not have vehicle"))
			return
		}

		//update the vehicle in the database
		err = mon.GoVehicle.Update(vehicleId, vehicle)
		if err != nil {
			HandleError(c, http.StatusInternalServerError, err)
			return
		}

		HandleSuccess(c, http.StatusAccepted, gin.H{
			"message": "vehicle updated",
		})
	})

	router.DELETE("vehicles/:id", func(c *gin.Context) {
		token := c.GetHeader("Authorization")
		if token == "" {
			HandleError(c, http.StatusUnauthorized, fmt.Errorf("no token provided"))
			return
		}

		userSesh := sesh.GetSesh()[token]

		if userSesh.Username == "" {
			HandleError(c, http.StatusUnauthorized, fmt.Errorf("no user found"))
			return
		}

		//get the user from the database and check if the user has the vehicle
		user, err := mon.GoUser.Get(userSesh.Username)
		if err != nil {
			HandleError(c, http.StatusInternalServerError, err)
			return
		}

		//check that the vehicle is in the user's vehicles
		//if it is remove it from the user's vehicles and also the mongo database
		vehicleId := c.Param("id")

		//check to see if the user has the vehicle
		if !user.ContainsVehicle(vehicleId) {
			HandleError(c, http.StatusUnauthorized, fmt.Errorf("user does not have vehicle"))
			return
		}

		//remove the vehicle from the user's vehicles
		mon.GoUser.RemoveFromField(userSesh.Username, "vehicles", vehicleId)

		//remove the vehicle from the database
		err = mon.GoVehicle.Delete(vehicleId)
		if err != nil {
			HandleError(c, http.StatusInternalServerError, err)
			return
		}

		HandleSuccess(c, http.StatusAccepted, gin.H{
			"message": "vehicle deleted",
		})
	})

	return router
}
