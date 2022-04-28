package mon

import (
	"context"
	"log"
	"strings"

	//import security package
	"github.com/ottery-app/backend/security"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

type Mon struct {
	GoRegister func(string, string, string, string) string
	GoRemove   func(string)
	Disconnect func()
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

	mon.GoRegister = func(email string, name string, address string, password string) string {
		code := security.RandomString()
		//add the user to the database with the key attached
		users.InsertOne(ctx, bson.M{
			"_id":      strings.ToLower(email),
			"name":     name,
			"address":  address,
			"password": password,
			"code":     code,
		})

		//return the code and the error
		return code
	}

	mon.GoRemove = func(email string) {
		users.DeleteOne(ctx, bson.M{"_id": strings.ToLower(email)})
	}

	mon.GoActivate = func(email string, code string) bool {
		//check to see if the code given matches the user's code in the database
		//if it does then remove the code from the user's database
		//if it doesnt then return an error

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
