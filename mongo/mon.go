package mon

import (
	"context"
	"log"
	"reflect"
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
	GoUpdateUser      func(string, usertypes.User) error
	GoLinkTokenToUser func(string, string) error
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

	mon.GoRegisterUser = func(email string, name string, address string, password string) (code string, err error) {
		code = security.RandomString()
		//add the user to the database with the key attached
		_, err = users.InsertOne(ctx, bson.M{
			"_id":            strings.ToLower(email),
			"name":           name,
			"address":        address,
			"password":       password,
			"ActivationCode": code,
		})

		return code, err
	}

	mon.GoRemoveUser = func(email string) error {
		_, err := users.DeleteOne(ctx, bson.M{"_id": strings.ToLower(email)})
		return err
	}

	mon.GoActivateUser = func(email string, ActivationCode string) (token string, err error) {
		user, err := mon.GoGetUser(email)

		if user.ActivationCode == ActivationCode {
			user.ActivationCode = ""
			err = mon.GoUpdateUser("ActivationCode", user)
			token = security.GenerateSecureToken()
			err = mon.GoLinkTokenToUser(email, token)
		}

		return token, err
	}

	mon.GoGetUser = func(email string) (user usertypes.User, err error) {
		err = users.FindOne(ctx, bson.M{"_id": strings.ToLower(email)}).Decode(&user)
		return user, err
	}

	mon.GoUpdateUser = func(field string, user usertypes.User) error {
		r := reflect.ValueOf(user)
		val := reflect.Indirect(r).FieldByName(field)

		_, err := users.UpdateOne(ctx, bson.M{"_id": strings.ToLower(user.Email)}, bson.M{"$set": bson.M{field: val}})
		return err
	}

	mon.GoLinkTokenToUser = func(email string, token string) error {
		_, err := tokens.InsertOne(ctx, bson.M{"_id": token, "user_id": strings.ToLower(email)})
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
