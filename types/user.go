package types

type User struct {
	Email          string   `json:"email"`
	Password       string   `json:"password"`
	FirstName      string   `json:"firstName"`
	LastName       string   `json:"lastName"`
	Address        string   `json:"address"`
	City           string   `json:"city"`
	State          string   `json:"state"`
	Zip            string   `json:"zip"`
	ActivationCode string   `json:"activationCode"`
	Kids           []string `json:"kids"`
	Vehicles       []string `json:"vehicles"`
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
	u.Vehicles = nil
}

//method that checks if the user contains a given vehicle id
func (u *User) ContainsVehicle(id string) bool {
	for _, v := range u.Vehicles {
		if v == id {
			return true
		}
	}
	return false
}
