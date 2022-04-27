package mon

import (
	"context"
	"fmt"
	"log"
	"math/rand"
	"time"

	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

type Mon struct {
	GoRegister func(string, string, string, string) string
}

/**
 * this is a function factory. It generates a bunch of functions in a struct that can then be used
 * to interact with the mongo database later so that you dont need to keep reconnecting or rewriting
 * the same code over and over again
 */
func Go() (mon Mon) {
	//this is the client that connects to mongo
	//client := connect()
	//^^^^^^^^^^^^^^^^^^
	mon.GoRegister = func(email string, name string, address string, password string) string {
		code := randomString()
		fmt.Println(email + name + address + password + code) //add to server
		return code
	}

	return mon
}

func connect() *mongo.Client {
	const dbLink = "mongodb+srv://web-app:FktpDZRgrNbwwZw4@cluster0.jzohf.mongodb.net/myFirstDatabase?retryWrites=true&w=majority"

	client, err := mongo.NewClient(options.Client().ApplyURI(dbLink))

	if err != nil {
		log.Fatal(err)
	}

	ctx, _ := context.WithTimeout(context.Background(), 10*time.Second)
	err = client.Connect(ctx)
	if err != nil {
		log.Fatal(err)
	}

	defer client.Disconnect(ctx)

	return client
}

func randomString() string {
	rand.Seed(time.Now().Unix())
	b := make([]byte, 5)
	charset := "randomsturgillnoises01234567890123456789"

	for i := range b {
		b[i] = charset[rand.Intn(len(charset))]
	}

	return string(b)
}
