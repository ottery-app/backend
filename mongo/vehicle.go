package mongo

import (
	"context"

	"github.com/ottery-app/backend/types"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
)

type goVehicle struct {
	New func(string, types.Vehicle) (string, error)
	Get func(string) (types.Vehicle, error)
}

func (mon *Mon) vehicle(ctx context.Context, database *mongo.Database) {
	vehicles := database.Collection("vehicles")
	mon.GoVehicle = goVehicle{}

	mon.GoVehicle.New = func(owner string, vehicle types.Vehicle) (id string, err error) {
		vehicle.Owner = id

		res, err := vehicles.InsertOne(ctx, vehicle)

		if err != nil {
			return "", err
		}

		id = res.InsertedID.(primitive.ObjectID).Hex()

		return id, nil
	}

	mon.GoVehicle.Get = func(id string) (vehicle types.Vehicle, err error) {
		var oid primitive.ObjectID
		oid, err = primitive.ObjectIDFromHex(id)
		err = vehicles.FindOne(ctx, bson.M{"_id": oid}).Decode(&vehicle)
		return vehicle, err
	}
}
