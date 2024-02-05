// send mail to specific user with nodemailer
import * as nodemailer from 'nodemailer';


export function sendMailToUser(receiver: string, message: string) {
  console.log(`Mail sent to ${receiver} with message: ${message}`)

}
