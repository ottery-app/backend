package mongo

import (
	"context"
	"fmt"
	"strings"

	"github.com/ottery-app/backend/security"
	"github.com/ottery-app/backend/types"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
)

type goUser struct {
	Register        func(string, string, string, string, string, string, string, string, string) (string, error)
	Delete          func(string) error
	Activate        func(string, string) error
	Get             func(string) (types.User, error)
	UpdateField     func(string, string, interface{}) error
	RemoveField     func(string, string) error
	AppendField     func(string, string, interface{}) error
	Search          func(string) ([]types.User, error)
	Update          func(types.User) error
	RemoveFromField func(string, string, interface{}) error
}

func (mon *Mon) user(ctx context.Context, database *mongo.Database) {
	users := database.Collection("users")
	mon.GoUser = goUser{}

	mon.GoUser.Register = func(email string, firstName string, lastName string, address string, city string, state string, zip string, password string, username string) (code string, err error) {
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

	mon.GoUser.Delete = func(username string) error {
		_, err := users.DeleteOne(ctx, bson.M{"_id": username})
		return err
	}

	mon.GoUser.Activate = func(username string, activationCode string) (err error) {
		user, err := mon.GoUser.Get(username)

		if err != nil {
			return err
		}

		if user.ActivationCode == activationCode {
			err = mon.GoUser.RemoveField(user.Username, "activationCode")

			if err != nil {
				return err
			}
		}

		return err
	}

	mon.GoUser.Get = func(id string) (user types.User, err error) {
		err = users.FindOne(ctx, bson.M{"_id": strings.ToLower(id)}).Decode(&user)
		return user, err
	}

	mon.GoUser.UpdateField = func(id string, field string, val interface{}) error {
		err := mon.updateOne(users, id, field, "$set", val)
		return err
	}

	mon.GoUser.AppendField = func(id string, field string, val interface{}) error {
		err := mon.updateOne(users, id, field, "$push", val)

		//if the field is not an array, then we need to remove the old value
		if err != nil {
			err = mon.GoUser.RemoveField(id, field)
			if err != nil {
				return err
			}

			err = mon.updateOne(users, id, field, "$push", val)
		}

		return err
	}

	mon.GoUser.RemoveFromField = func(id string, field string, val interface{}) error {
		//removes the first instance of the value from the array in the user
		err := mon.updateOne(users, id, field, "$pull", bson.M{field: val})
		return err
	}

	mon.GoUser.RemoveField = func(id string, field string) error {
		err := mon.updateOne(users, id, field, "$unset", "")
		return err
	}

	mon.GoUser.Search = func(search string) (results []types.User, err error) {
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

	mon.GoUser.Update = func(user types.User) error {
		err := users.FindOneAndReplace(ctx, bson.M{"_id": user.Username}, user).Err()

		return err
	}
}
