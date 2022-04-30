package miscellaneous

import (
	"fmt"
	"io/ioutil"
	"net/http"
)

func PrintFromGithub(link string) {
	resp, _ := http.Get(link)
	body, _ := ioutil.ReadAll(resp.Body)
	fmt.Println(string(body))
}
