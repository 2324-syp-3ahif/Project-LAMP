import * as nodemailer from 'nodemailer';
import * as utils from '../utils';

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

export function sendInviteMail(receiver: string, listID: number): void {
    const hashedID: string = utils.hashString(listID.toString());
    const link: string = `http://localhost:3000/signup?listID=${hashedID}`;
    const message: string = `Hello my dear friend!\nYou have been invited to join a tasklist on our platform.\n Please click on the link to sign up.` + link;
    sendMailToUser(receiver, message, 'Tasklist Invitation');
    // save link in local storage for use after signup
    localStorage.setItem('listID', listID.toString()); 
}
