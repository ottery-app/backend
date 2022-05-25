package types

type Vehicle struct {
	Id    string `json:"_id"`
	Make  string `json:"make"`
	Model string `json:"model"`
	Year  int    `json:"year"`
	Color string `json:"color"`
	Plate string `json:"plate"`
	Owner string `json:"owner"`
}
