package types

type Kid struct {
	Id string `json:"_id"`

	FirstName  string `json:"firstName"`
	LastName   string `json:"lastName"`
	MiddleName string `json:"middleName"`
	Birthday   int    `json:"birthday"`

	//we can just assume location is on the parent's info

	Owner               string   `json:"owner"`
	PrimaryGuardians    []string `json:"PrimaryGuardians"`
	AuthorizedGuardians []string `json:"AuthorizedGuardians"`
}

//method checks if the user id passed in is a primary guardian
func (kid *Kid) IsPrimaryGuardian(id string) bool {
	for _, guardian := range kid.PrimaryGuardians {
		if guardian == id {
			return true
		}
	}
	return false
}

//method checks if the user is the owner
func (kid *Kid) IsOwner(id string) bool {
	return kid.Owner == id
}
