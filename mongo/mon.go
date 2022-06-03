package mon

import (
	"context"
	"fmt"
	"log"
	"strings"

	//import security package
	"github.com/ottery-app/backend/security"
	"github.com/ottery-app/backend/types"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

type Mon struct {
	Disconnect func()

	GoRegisterUser        func(string, string, string, string, string, string, string, string, string) (string, error)
	GoRemoveUser          func(string) error
	GoActivateUser        func(string, string) error
	GoGetUser             func(string) (types.User, error)
	GoUpdateUserField     func(string, string, interface{}) error
	GoRemoveUserField     func(string, string) error
	GoAppendUserField     func(string, string, interface{}) error
	GoSearchUser          func(string) ([]types.User, error)
	GoUpdateUser          func(types.User) error
	GoRemoveFromUserField func(string, string, interface{}) error

	GoNewVehicle func(string, types.Vehicle) (string, error)
	GoGetVehicle func(string) (types.Vehicle, error)

	GoNewKid    func(string, string, string, int, string, []string, []string) (string, error)
	GoGetKid    func(string) (types.Kid, error)
	GoUpdateKid func(types.Kid) error
	GoDeleteKid func(string) error
}

/**
 * this is a function factory. It generates a bunch of functions in a struct that can then be used
 * to interact with the mongo database later so that you dont need to keep reconnecting or rewriting
 * the same code over and over again
 */
func Go() (mon Mon) {
	//this is the client that connects to mongo
	client, ctx, disconect := connect()
	mon.Disconnect = disconect

	//gets the database aspects
	database := client.Database("ottery")
	users := database.Collection("users")
	kids := database.Collection("kids")
	vehicles := database.Collection("vehicles")

	//This is a helper function so that code does not need to be written twice
	updateOne := func(database *mongo.Collection, id string, field string, updateType string, val interface{}) error {
		_, err := database.UpdateOne(
			ctx,
			bson.D{
				{"_id", id},
			},
			bson.D{
				{updateType, bson.D{
					{field, val},
				}},
			},
		)
		return err
	}

	//this is a helper function so that code does not need to be written twice
	/*
		removeFirst := func(database *mongo.Collection, field string, val interface{}) (err error) {
			_, err = database.DeleteOne(ctx, bson.M{field: val})
			return err
		}
	*/

	//this is a helper function so that code does not need to be written twice
	/*
		removeAll := func(database *mongo.Collection, field string, val interface{}) (err error) {
			_, err = database.DeleteMany(ctx, bson.M{field: val})
			return err
		}
	*/

	mon.GoRegisterUser = func(email string, firstName string, lastName string, address string, city string, state string, zip string, password string, username string) (code string, err error) {
		code = security.RandomString()
		//add the user to the database with the key attached
		_, err = users.InsertOne(ctx, bson.M{
			"_id":            username,
			"username":       username,
			"email":          strings.ToLower(email),
			"firstName":      firstName,
			"lastName":       lastName,
			"address":        address,
			"city":           city,
			"state":          state,
			"zip":            zip,
			"password":       password,
			"activationCode": code,
		})

		return code, err
	}

	mon.GoRemoveUser = func(username string) error {
		_, err := users.DeleteOne(ctx, bson.M{"_id": username})
		return err
	}

	mon.GoActivateUser = func(username string, activationCode string) (err error) {
		user, err := mon.GoGetUser(username)

		if err != nil {
			return err
		}

		if user.ActivationCode == activationCode {
			err = mon.GoRemoveUserField(user.Username, "activationCode")

			if err != nil {
				return err
			}
		}

		return err
	}

	mon.GoGetUser = func(id string) (user types.User, err error) {
		err = users.FindOne(ctx, bson.M{"_id": strings.ToLower(id)}).Decode(&user)
		return user, err
	}

	mon.GoUpdateUserField = func(id string, field string, val interface{}) error {
		err := updateOne(users, id, field, "$set", val)
		return err
	}

	mon.GoAppendUserField = func(id string, field string, val interface{}) error {
		err := updateOne(users, id, field, "$push", val)

		//if the field is not an array, then we need to remove the old value
		if err != nil {
			err = mon.GoRemoveUserField(id, field)
			if err != nil {
				return err
			}

			err = updateOne(users, id, field, "$push", val)
		}

		return err
	}

	mon.GoRemoveFromUserField = func(id string, field string, val interface{}) error {
		//removes the first instance of the value from the array in the user
		err := updateOne(users, id, field, "$pull", bson.M{field: val})
		return err
	}

	mon.GoRemoveUserField = func(id string, field string) error {
		err := updateOne(users, id, field, "$unset", "")
		return err
	}

	mon.GoSearchUser = func(search string) (results []types.User, err error) {
		query := bson.M{
			"$text": bson.M{
				"$search": search,
			},
		}

		cur, err := users.Find(ctx, query)

		if err != nil {
			return results, err
		}

		err = cur.All(ctx, &results)

		if err != nil {
			fmt.Println("there is an issue in the searching. because there is no search index??")
			return results, err
		}

		//for each result call the MakeSafe method to remove personal information
		for i := 0; i < len(results); i++ {
			results[i].MakeSafe()
		}

		fmt.Println("made it to line 176")

		if err != nil {
			return nil, err
		}

		fmt.Println("made it to line 182")

		return results, nil
	}

	mon.GoUpdateUser = func(user types.User) error {
		err := users.FindOneAndReplace(ctx, bson.M{"_id": user.Username}, user).Err()

		return err
	}

	mon.GoNewVehicle = func(id string, vehicle types.Vehicle) (string, error) {
		vehicle.Owner = id

		res, err := vehicles.InsertOne(ctx, vehicle)

		if err != nil {
			return "", err
		}

		id = res.InsertedID.(primitive.ObjectID).Hex()

		return id, nil
	}

	mon.GoGetVehicle = func(id string) (vehicle types.Vehicle, err error) {
		var oid primitive.ObjectID
		oid, err = primitive.ObjectIDFromHex(id)
		err = vehicles.FindOne(ctx, bson.M{"_id": oid}).Decode(&vehicle)
		return vehicle, err
	}

	mon.GoNewKid = func(firstName string, middleName string, lastName string, birthday int, owner string, primaryGuardians []string, authorizedGuardians []string) (id string, err error) {
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

	mon.GoGetKid = func(id string) (kid types.Kid, err error) {
		var oid primitive.ObjectID
		oid, err = primitive.ObjectIDFromHex(id)
		err = kids.FindOne(ctx, bson.M{"_id": oid}).Decode(&kid)
		return kid, err
	}

	mon.GoUpdateKid = func(kid types.Kid) error {
		err := kids.FindOneAndReplace(ctx, bson.M{"_id": kid.Id}, kid).Err()
		return err
	}

	mon.GoDeleteKid = func(id string) error {
		//get the kid and remove itself from all of the authorized guardians
		kid, err := mon.GoGetKid(id)

		if err != nil {
			return err
		}

		//only need to remove from authorized guardians because that includes alls of the guardians regardless of type
		for i := 0; i < len(kid.AuthorizedGuardians); i++ {
			err = mon.GoRemoveFromUserField(kid.AuthorizedGuardians[i], "kids", id)

			if err != nil {
				return err
			}
		}

		//handle success
		err = kids.FindOneAndDelete(ctx, bson.M{"_id": kid.Id}).Err()

		return err
	}

	return mon
}

func connect() (client *mongo.Client, ctx context.Context, disconect func()) {
	const dbLink = "mongodb+srv://web-app:FktpDZRgrNbwwZw4@cluster0.jzohf.mongodb.net/myFirstDatabase?retryWrites=true&w=majority"

	client, err := mongo.NewClient(options.Client().ApplyURI(dbLink))

	if err != nil {
		log.Fatal(err)
	}

	ctx = context.Background()

	err = client.Connect(ctx)
	if err != nil {
		log.Fatal(err)
	}

	disconect = func() {
		err = client.Disconnect(ctx)
		if err != nil {
			log.Fatal(err)
		}
	}

	return client, ctx, disconect
}
