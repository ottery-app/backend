package mailer

import (
	"net/smtp"
)

func Send(recipient string, subject string, body string) {
	from := "noreplyottery@gmail.com"
	password := "fltclzxqhwhxiuvc"

	to := []string{recipient}

	host := "smtp.gmail.com"
	port := "587"
	address := host + ":" + port

	message := []byte("Subject: " + subject + "\n" + body)

	auth := smtp.PlainAuth("", from, password, host)

	err := smtp.SendMail(address, auth, from, to, message)
	if err != nil {
		panic(err)
	}
}
