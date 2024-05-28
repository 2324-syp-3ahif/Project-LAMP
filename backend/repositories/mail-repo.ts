import * as nodemailer from 'nodemailer';
import * as utils from '../utils';

const footer: string = `\n\nBest regards,\nYour Project LAMP Team\n\nThis is an automated message. Please do not reply to this email.\n\n\n@2024 Luca Haas, Andreas Huber, Melanie Dohr, Philip Raab. All rights reserved.`;

export function sendMailToUser(receiver: string, message: string, subj: string): void {
    console.log(`Mail sent to ${receiver} with message: ${message}`)
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'lamp.noreply@gmail.com',
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

export function sendInviteMail(receiver: string, link: string): void {
    const message: string = `Hello my dear friend!\nYou have been invited to join a tasklist on our platform.\n Please click on the link to sign up or login.` + link + footer;
    sendMailToUser(receiver, message, 'Tasklist Invitation');
}
