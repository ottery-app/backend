package types

type Event struct {
	ID           string       `json:"id"`
	Name         string       `json:"name"`
	Date         int          `json:"date"`
	StartTime    int          `json:"startTime"`
	EndTime      int          `json:"endTime"`
	Repeats      string       `json:"repeats"`
	Location     string       `json:"location"`
	Description  string       `json:"description"`
	Manager      string       `json:"manager"`
	Orginization Orginization `json:"organization"`
	Kids         []string     `json:"kids"`
	Volenteers   []string     `json:"volenteers"`
}

//method to add a volenteer to the event
func (e *Event) AddVolenteer(id string) {
	e.Volenteers = append(e.Volenteers, id)
}

//method to remove a volenteer from the event
func (e *Event) RemoveVolenteer(id string) {
	for i, volenteer := range e.Volenteers {
		if volenteer == id {
			e.Volenteers = append(e.Volenteers[:i], e.Volenteers[i+1:]...)
			return
		}
	}
}

//method to add a kid to the event
func (e *Event) AddKid(id string) {
	e.Kids = append(e.Kids, id)
}

//method to remove a kid from the event
func (e *Event) RemoveKid(id string) {
	for i, kid := range e.Kids {
		if kid == id {
			e.Kids = append(e.Kids[:i], e.Kids[i+1:]...)
			return
		}
	}
}
