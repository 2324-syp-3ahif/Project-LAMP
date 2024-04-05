import express from "express";
import {StatusCodes} from "http-status-codes";
import {connectToDatabase} from "../database-functions/connect";
import bcrypt from "bcrypt";
import {User} from "../interfaces/model/User";
import {selectUserByEmail} from "../database-functions/select-data";
import {insertUser, idFound} from "../database-functions/insert-data";
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
        res.sendStatus(StatusCodes.BAD_REQUEST);
    }
});
