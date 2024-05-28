import express from "express";
import { sendInviteMail } from "../repositories/mail-repo";
import {isAuthenticated} from "../middleware/auth-handlers";
import jwt from 'jsonwebtoken';

export const mailRouter = express.Router();

mailRouter.post("/invite/:receiver/:listID", isAuthenticated, (req, res) => {
    const { receiver, tasklistID } = req.body;
    const secretKey = process.env.SECRET_KEY as string;

    const token: string = jwt.sign({ receiver, tasklistID }, secretKey, { expiresIn: '24h' });

    const confirmationLink: string = `http://localhost:${process.env.port}/api/mail/confirm?token=${token}`; // TODO change Link to real server

    console.log(`Send this link to ${receiver}: ${confirmationLink}`);
    sendInviteMail(req.params.receiver, confirmationLink);

    res.status(200).send("Invitation mail sent!");

});

mailRouter.get('/confirm', (req, res) => {
    const token = req.query.token as string;
    const secretKey = process.env.SECRET_KEY as string;
    try {
        const decoded = jwt.verify(token, secretKey) as { email: string; tasklistID: string };
        const { email, tasklistID } = decoded;
        console.log(`Token decoded: ${email} ${tasklistID}`);

        res.redirect(`http://localhost:${process.env.port}/success`);
        // TODO: redirect to frontend success page
        // TODO: redirect to frontend login page
    } catch (error) {
        res.status(400).send('Invalid or expired token');
    }
});

