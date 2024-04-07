import express from "express";
import {StatusCodes} from "http-status-codes";
import {connectToDatabase} from "../database-functions/connect";
import bcrypt from "bcrypt";
import {selectUserByEmail} from "../database-functions/select-data";
import {insertUser, idFound} from "../database-functions/insert-data";
import {StringWrongFormatError} from "../interfaces/errors/StringWrongFormatError";
export const loginRouter = express.Router();

loginRouter.post("/login", async (req, res) => {
    try{
        const user = await selectUserByEmail(connectToDatabase(), req.body.email);
        res.sendStatus(await bcrypt.compare(req.body.password, user.hashedPassword) ? StatusCodes.OK : StatusCodes.BAD_REQUEST);
    } catch (e){
        res.sendStatus(StatusCodes.BAD_REQUEST);
    }
});
loginRouter.post("/register", async (req, res) => {
    try{
        await insertUser(connectToDatabase(), req.body.email, req.body.username, req.body.password);
        res.sendStatus(StatusCodes.OK);
    } catch (e){
        console.log(e);
        // TODO: also say what requirements are not met (in the frontend maybe, not here in the backend)
        // TODO: log error in browser (what exactly went wrong e.g. password too short, email already exists, etc.)
        res.sendStatus(StatusCodes.BAD_REQUEST);
    }
});
