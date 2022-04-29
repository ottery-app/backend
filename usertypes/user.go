package usertypes

type User struct {
	Id             string `json:"_id"`
	Email          string `json:"email"`
	Password       string `json:"password"`
	Name           string `json:"name"`
	Address        string `json:"address"`
	ActivationCode string `json:"code"`
}
