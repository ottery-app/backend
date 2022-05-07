package usertypes

type User struct {
	Id             string `json:"_id"` //this is the email
	Password       string `json:"password"`
	FirstName      string `json:"firstName"`
	LastName       string `json:"lastName"`
	Address        string `json:"address"`
	City           string `json:"city"`
	State          string `json:"state"`
	Zip            string `json:"zip"`
	ActivationCode string `json:"activationCode"`
}
