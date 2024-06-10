import express from "express";
import { sendInviteMail } from "../repositories/mail-repo";
import {isAuthenticated} from "../middleware/auth-handlers";
import {addCollaboratorToTasklist} from "../database-functions/usertaklist-functions";
import jwt from 'jsonwebtoken';
import dotenv from "dotenv";

dotenv.config();

export const mailRouter = express.Router();
export const baseURL = process.env.PORT == undefined ? "http://project-lamp.duckdns.org" : "http://localhost:" + process.env.PORT;

mailRouter.post("/invite/:receiver/:listID", isAuthenticated, (req, res) => {
    const receiver: string = req.params.receiver;
    const listID: string = req.params.listID;
    const secretKey = process.env.SECRET_KEY as string;

    if (!secretKey) {
        console.error('Secret key is not set in environment variables');
        return res.status(500).send('Internal Server Error');
    }

    const token: string = jwt.sign({ receiver, listID }, secretKey, { expiresIn: '24h' });
    const confirmationLink: string = `${baseURL}/api/mail/confirm?token=${token}`; // TODO change Link to real server

    console.log(`Send this link to ${receiver}: ${confirmationLink}`);
    sendInviteMail(req.params.receiver, confirmationLink);

    res.status(200).send("Invitation mail sent!");

});

mailRouter.get('/confirm', async (req, res) => {
    const token = req.query.token as string;
    const secretKey = process.env.SECRET_KEY as string;

    if (!token) {
        return res.status(400).send('Token is required');
    }

    if (!secretKey) {
        console.error('Secret key is not set in environment variables');
        return res.status(500).send('Internal Server Error');
    }

    try {
        const decoded = jwt.verify(token, secretKey) as { receiver: string; listID: string };
        const { receiver, listID } = decoded;

        console.log(`Token decoded: ${receiver} ${listID}`);

        await addCollaboratorToTasklist(parseInt(listID), receiver);

        res.redirect(`${baseURL}/success`);
    } catch (error) {
        res.status(400).send('Invalid or expired token');
    }
});

