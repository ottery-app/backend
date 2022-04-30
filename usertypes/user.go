package usertypes

type User struct {
	Id             string `json:"_id"` //this is the email
	Password       string `json:"password"`
	Name           string `json:"name"`
	Address        string `json:"address"`
	ActivationCode string `json:"activationCode"`
}
