package mongo

import (
	"context"

	"github.com/ottery-app/backend/types"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
)

type goChild struct {
	New    func(string, string, string, int, string, []string, []string) (string, error)
	Get    func(string) (types.Kid, error)
	Update func(types.Kid) error
	Delete func(string) error
}

func (mon *Mon) child(ctx context.Context, database *mongo.Database) {
	kids := database.Collection("kids")
	mon.GoChild = goChild{}

	mon.GoChild.New = func(firstName string, middleName string, lastName string, birthday int, owner string, primaryGuardians []string, authorizedGuardians []string) (id string, err error) {
		res, err := kids.InsertOne(ctx, bson.M{
			"firstName":           firstName,
			"middleName":          middleName,
			"lastName":            lastName,
			"birthday":            birthday,
			"owner":               owner,
			"primaryGuardians":    primaryGuardians,
			"authorizedGuardians": authorizedGuardians,
		})

		//get the id of the kid
		id = res.InsertedID.(primitive.ObjectID).Hex()

		return id, err
	}

	mon.GoChild.Get = func(id string) (kid types.Kid, err error) {
		var oid primitive.ObjectID
		oid, err = primitive.ObjectIDFromHex(id)
		err = kids.FindOne(ctx, bson.M{"_id": oid}).Decode(&kid)
		return kid, err
	}

	mon.GoChild.Update = func(kid types.Kid) (err error) {
		var oid primitive.ObjectID
		oid, err = primitive.ObjectIDFromHex(kid.Id)

		if err != nil {
			return err
		}

		err = kids.FindOneAndReplace(ctx, bson.M{"_id": oid}, kid).Err()
		return err
	}

	mon.GoChild.Delete = func(id string) error {
		//get the kid and remove itself from all of the authorized guardians
		kid, err := mon.GoChild.Get(id)

		if err != nil {
			return err
		}

		//get oid
		oid, err := primitive.ObjectIDFromHex(kid.Id)

		if err != nil {
			return err
		}

		//only need to remove from authorized guardians because that includes alls of the guardians regardless of type
		for i := 0; i < len(kid.AuthorizedGuardians); i++ {
			err = mon.GoUser.RemoveFromField(kid.AuthorizedGuardians[i], "kids", id)

			if err != nil {
				return err
			}
		}

		//handle success
		err = kids.FindOneAndDelete(ctx, bson.M{"_id": oid}).Err()

		return err
	}

	return
}
