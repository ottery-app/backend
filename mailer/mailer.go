package mailer

import (
	"bytes"
	"html/template"
	"net/smtp"
)

const mime = "MIME-version: 1.0;\nContent-Type: text/html; charset=\"UTF-8\";\n\n"

type Request struct {
	from    string
	to      []string
	subject string
	body    string
}

func newRequest(to []string, subject string) *Request {
	return &Request{
		to:      to,
		subject: subject,
	}
}

func parseTemplate(fileName string, data interface{}) (body string, err error) {
	t, err := template.ParseFiles(fileName)
	if err != nil {
		return
	}
	buffer := new(bytes.Buffer)

	if err = t.Execute(buffer, data); err != nil {
		return
	}

	body = buffer.String()

	return
}

func Send(recipient string, subject string, body string) error {
	from := "noreplyottery@gmail.com"
	password := "fltclzxqhwhxiuvc"

	to := []string{recipient}

	host := "smtp.gmail.com"
	port := "587"
	address := host + ":" + port

	message := []byte("Subject: " + subject + "\n" + mime + "\n" + body)

	auth := smtp.PlainAuth("", from, password, host)

	err := smtp.SendMail(address, auth, from, to, message)

	return err
}

func SendActivation(recipient string, code string) error {
	body, err := parseTemplate("mailer/emailFormats/activate.html", map[string]string{"code": code})

	if err != nil {
		return err
	}

	err = Send(recipient, code+" activate your account", body)
	return err
}
