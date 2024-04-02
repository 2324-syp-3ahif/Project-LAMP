import express from "express";
import { sendInviteMail } from "../collaboration";
export const mailRouter = express.Router();

mailRouter.get("/", (req, res) => {
    res.status(200).send("Hello World!, from Mail Router");
});

mailRouter.get("/invite/:receiver/:listID", (req, res) => {
    sendInviteMail(req.params.receiver, parseInt(req.params.listID));
    res.status(200).send("Mail sent!");
});
