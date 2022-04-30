package main

import (
	"fmt"

	"github.com/ottery-app/backend/api"
	"github.com/ottery-app/backend/miscellaneous"
)

func main() {
	miscellaneous.PrintFromGithub("https://raw.githubusercontent.com/ottery-app/global-data/main/images/ascii/greet.txt")
	start()
}

func start() {
	defer restart()
	api.Api()
}

func restart() {
	if r := recover(); r != nil {
		miscellaneous.PrintFromGithub("https://raw.githubusercontent.com/ottery-app/global-data/main/images/ascii/surprise.txt")
		fmt.Println("holy smokes what happened there... lets act like that didn't happen...")
		start()
	}
}
