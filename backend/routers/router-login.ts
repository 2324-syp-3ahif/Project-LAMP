import express from "express";
import jwt from "jsonwebtoken";
import {StatusCodes} from "http-status-codes";
import {connectToDatabase} from "../database-functions/connect";
import bcrypt from "bcrypt";
import {selectUserByEmail} from "../database-functions/select-data";
import {insertUser, idFound} from "../database-functions/insert-data";
import {StringWrongFormatError} from "../interfaces/errors/StringWrongFormatError";
import dotenv from "dotenv";
dotenv.config();
export const loginRouter = express.Router();

loginRouter.post("/login", async (req, res) => {
    try{
        const user = await selectUserByEmail(connectToDatabase(), req.body.email);
        if(!await bcrypt.compare(req.body.password, user.hashedPassword)){
            throw new Error("Wrong password!");
        }
        const minutes: number = 15;
        const expiresAt: Date = new Date(Date.now() + minutes * 60000);
        const token: string = jwt.sign({
            user: user.email,
            exp: expiresAt.getTime() / 1000,
        },
        process.env.SECRET_KEY as string
        );
        res.status(StatusCodes.OK).json({
            user: user,
            expiresAt: expiresAt.getTime(),
            accessToken: token,
        });
    } catch (e){
        res.sendStatus(StatusCodes.UNAUTHORIZED);
    }
});
loginRouter.post("/register", async (req, res) => {
    try{
        await insertUser(connectToDatabase(), req.body.email, req.body.username, req.body.password);
        res.sendStatus(StatusCodes.CREATED);
    } catch (e){
        console.log(e);
        // TODO: also say what requirements are not met (in the frontend maybe, not here in the backend)
        // TODO: log error in browser (what exactly went wrong e.g. password too short, email already exists, etc.)
        res.sendStatus(StatusCodes.BAD_REQUEST);
    }
});
