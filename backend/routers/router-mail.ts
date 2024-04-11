import express from "express";
import { sendInviteMail } from "../repositories/mail-repo";
import {isAuthenticated} from "../middleware/auth-handlers";
export const mailRouter = express.Router();

mailRouter.post("/invite/:receiver/:listID", isAuthenticated, (req, res) => {
    sendInviteMail(req.params.receiver, parseInt(req.params.listID));
    res.status(200).send("Mail sent!");
});
