// send mail to specific user with nodemailer
import * as nodemailer from 'nodemailer';
import * as utils from './utils';

export function sendMailToUser(receiver: string, message: string, subj: string): void {
    console.log(`Mail sent to ${receiver} with message: ${message}`)
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'project.lamp@gmail.com',
            pass: process.env.EMAIL_PASSWORD
        }
    });
    transporter.sendMail({to: receiver, text: message, subject: subj}, function (error, info) {
        if (error) {
            console.log(error);
        } else {
            console.log(`Email sent: ${info.response}`);
        }
    });
}
