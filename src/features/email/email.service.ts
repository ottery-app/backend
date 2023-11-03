import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import * as fs from 'fs';
import { email, activationCode } from '@ottery/ottery-dto';

const FROM = `"Ottery-noreply" <${process.env.EMAIL_USERNAME}>`;

/**
 * Sends an email to the provided email for account registration
 *
 * @param to the email address to send the email to
 * @param subject the subject of the email
 * @param html the HTML template which is parsed and sent in the email
 * @returns an error (if there is one)
 */
async function send(to: email[], subject: string, html: string) {
  try {
    // create reusable transporter object using the default SMTP transport
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    const emails = to.reduce((a, b) => a + ', ' + b, '');

    await transporter.sendMail({
      from: FROM,
      to: emails,
      subject: subject,
      html: html,
    });
  } catch (e) {
    return e;
  }
}

function getTemplate(name: string) {
  return fs.readFileSync(`./assets/emailTemplates/${name}.html`).toString();
}

function htmlInject(html: string, vals: object) {
  Object.keys(vals).forEach((key) => {
    html = html.split(`{{${key}}}`).join(vals[key]);
  });

  return html;
}

@Injectable()
export class EmailService {
  sendActivationCode(recipent: email, code: activationCode) {
    const to = [recipent];
    const subject = `${code} activate your account`;
    const html = htmlInject(getTemplate('activate'), { code: code });
    return send(to, subject, html);
  }

  sendPasswordResetLink(recipient: email, link: string) {
    const to = [recipient];
    const subject = 'Forgot your password?';
    const html = htmlInject(getTemplate('reset-password'), { link: link });

    return send(to, subject, html);
  }
}
