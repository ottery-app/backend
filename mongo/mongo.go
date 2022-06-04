package mongo

import (
	"context"
	"log"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

type Mon struct {
	Disconnect func()

	updateOne func(database *mongo.Collection, id string, field string, updateType string, val interface{}) error

	GoChild   goChild
	GoUser    goUser
	GoVehicle goVehicle
}

func Go() (mon Mon) {
	//this is the client that connects to mongo
	client, ctx, disconect := connect()
	mon.Disconnect = disconect

	//gets the database aspects
	database := client.Database("ottery")
	mon.child(ctx, database)
	mon.user(ctx, database)
	mon.vehicle(ctx, database)

	mon.updateOne = func(database *mongo.Collection, id string, field string, updateType string, val interface{}) error {
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
