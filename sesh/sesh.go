package sesh

import (
	"sync"
	"time"
)

const DefaultState = "guardian"

var once sync.Once

type User struct {
	Id    string `json:"_id"` //this is the email
	State string `json:"state"`
}

// type global
//the string should be a token
type singleton map[string]User

var instance singleton //this may be the couse of a bug

func GetSesh() singleton {
	once.Do(func() { // <-- atomic, does not allow repeating
		instance = make(singleton) // <-- thread safe
	})

	return instance
}

//add a delete method to the session
func (s singleton) Delete(token string) {
	delete(s, token)
}

func (s singleton) Add(token string, user User) {
	s[token] = user

	go func() {
		//I HAVE NO IDEA IF THIS CODE WORKS HAHAHAHHA it probably does
		time.Sleep(time.Hour * 730) //one month and that login will be forgotten
		s.Delete(token)
	}()
}
