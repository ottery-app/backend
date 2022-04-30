package mon

import (
	"context"
	"log"
	"strings"

	//import security package
	"github.com/ottery-app/backend/security"
	"github.com/ottery-app/backend/usertypes"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

type Mon struct {
	Disconnect func()

	GoRegisterUser    func(string, string, string, string) (string, error)
	GoRemoveUser      func(string) error
	GoActivateUser    func(string, string) (string, error)
	GoGetUser         func(string) (usertypes.User, error)
	GoUpdateUserField func(string, string, interface{}) error
	GoRemoveUserField func(string, string) error
	GoLoadUser        func(string) (string, error)

	GoLinkTokenToUser       func(string, string) error
	GoRemoveTokenToUserLink func(string) error
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
	tokens := database.Collection("tokens")

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

	removeAll := func(database *mongo.Collection, field string, val interface{}) (err error) {
		_, err = database.DeleteMany(ctx, bson.M{field: val})
		return err
	}

	mon.GoRegisterUser = func(email string, name string, address string, password string) (code string, err error) {
		code = security.RandomString()
		//add the user to the database with the key attached
		_, err = users.InsertOne(ctx, bson.M{
			"_id":            strings.ToLower(email),
			"name":           name,
			"address":        address,
			"password":       password,
			"activationCode": code,
			"state":          "guardian", //this is the default state
		})

		return code, err
	}

	mon.GoRemoveUser = func(email string) error {
		_, err := users.DeleteOne(ctx, bson.M{"_id": strings.ToLower(email)})
		return err
	}

	mon.GoActivateUser = func(email string, activationCode string) (token string, err error) {
		user, err := mon.GoGetUser(email)

		if err != nil {
			return "", err
		}

		if user.ActivationCode == activationCode {
			err = mon.GoRemoveUserField(user.Id, "activationCode")

			if err != nil {
				return "", err
			}

			token = security.GenerateSecureToken()
		}

		return token, err
	}

	mon.GoGetUser = func(email string) (user usertypes.User, err error) {
		err = users.FindOne(ctx, bson.M{"_id": strings.ToLower(email)}).Decode(&user)
		user.Id = email //this is required because the id isnt stored using decode and we need the id attached
		return user, err
	}

	mon.GoUpdateUserField = func(id string, field string, val interface{}) error {
		err := updateOne(users, id, field, "$set", val)
		return err
	}

	mon.GoRemoveUserField = func(id string, field string) error {
		err := updateOne(users, id, field, "$unset", "")
		return err
	}

	mon.GoLinkTokenToUser = func(token string, email string) error {
		_, err := tokens.InsertOne(ctx, bson.M{"_id": token, "user_id": strings.ToLower(email)})
		return err
	}

	mon.GoRemoveTokenToUserLink = func(email string) (err error) {
		err = removeAll(tokens, "user_id", strings.ToLower(email))
		return err
	}

	mon.GoLoadUser = func(token string) (state string, err error) {
		doc := struct {
			Email string `bson:"user_id"`
		}{}

		err = tokens.FindOne(ctx, bson.M{"_id": token}).Decode(&doc)

		if err != nil {
			return state, err
		}

		user, err := mon.GoGetUser(doc.Email)

		return user.State, err
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
