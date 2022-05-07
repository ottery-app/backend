package types

type Kid struct {
	FirstName  string `json:"firstName"`
	LastName   string `json:"lastName"`
	MiddleName string `json:"middleName"`
	Birthday   string `json:"birthday"`
	//we can just assume location is on the parent's info
}
