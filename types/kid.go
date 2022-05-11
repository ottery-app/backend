package types

type Kid struct {
	Id string `json:"_id"`

	FirstName  string `json:"firstName"`
	LastName   string `json:"lastName"`
	MiddleName string `json:"middleName"`
	Birthday   string `json:"birthday"`

	//we can just assume location is on the parent's info

	Owner               string   `json:"owner"`
	PrimaryGuardians    []string `json:"PrimaryGuardians"`
	AuthorizedGuardians []string `json:"AuthorizedGuardians"`
}
