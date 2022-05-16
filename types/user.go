package types

type User struct {
	Id             string   `json:"_id"` //this is the email
	Password       string   `json:"password"`
	FirstName      string   `json:"firstName"`
	LastName       string   `json:"lastName"`
	Address        string   `json:"address"`
	City           string   `json:"city"`
	State          string   `json:"state"`
	Zip            string   `json:"zip"`
	ActivationCode string   `json:"activationCode"`
	Kids           []string `json:"kids"`
}

// method that is used to make the user safe
func (u *User) MakeSafe() {
	u.Password = ""
	u.ActivationCode = ""
	u.Kids = nil
	u.Address = ""
	u.City = ""
	u.State = ""
	u.Zip = ""
}
