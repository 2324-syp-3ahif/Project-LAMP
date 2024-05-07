import express from "express";
import jwt, {JwtPayload} from "jsonwebtoken";
import {StatusCodes} from "http-status-codes";
import {connectToDatabase} from "../database-functions/connect";
import bcrypt from "bcrypt";
import {selectUserByEmail} from "../database-functions/select-data";
import {insertUser, idFound} from "../database-functions/insert-data";
import {StringWrongFormatError} from "../interfaces/errors/StringWrongFormatError";
import dotenv from "dotenv";
import {generateTokens, verifyToken} from "./tokenUtils";
import {isAuthenticated} from "../middleware/auth-handlers";
dotenv.config();
export const loginRouter = express.Router();

loginRouter.post("/login", async (req, res) => {
    try{
        const user = await selectUserByEmail(connectToDatabase(), req.body.email);
        if(!await bcrypt.compare(req.body.password, user.hashedPassword)){
            throw new Error("Wrong password!");
        }

        const { accessToken, refreshToken } = generateTokens(user);
        res.cookie('refreshToken', refreshToken, { httpOnly: true, path: '/api/token/refresh' });
        res.json({ accessToken });
    } catch (e){
        res.status(StatusCodes.UNAUTHORIZED).send("Wrong password!");
    }
});
loginRouter.post("/register", async (req, res) => {
    try{
        await insertUser(connectToDatabase(), req.body.email, req.body.username, req.body.password);
        const user = await selectUserByEmail(connectToDatabase(), req.body.email);
        const { accessToken, refreshToken } = generateTokens(user);
        res.cookie('refreshToken', refreshToken, { httpOnly: true, path: '/api/token/refresh' });
        res.status(StatusCodes.CREATED).json({ accessToken });
    } catch (e){
        console.log(e);
        // TODO: also say what requirements are not met (in the frontend maybe, not here in the backend)
        // TODO: log error in browser (what exactly went wrong e.g. password too short, email already exists, etc.)
        res.status(StatusCodes.BAD_REQUEST).send("User already exists!");
    }
});

loginRouter.post('/token/refresh', async (req, res) => {
    const refreshToken = req.cookies.refreshToken;
    console.log(refreshToken + "is the refresh token")
    if (refreshToken) {
        try {
            const user = verifyToken(refreshToken, process.env.REFRESH_TOKEN_SECRET as string) as JwtPayload;
            if (user){
                const { accessToken } = generateTokens({ username: user.username, email: user.email });
                console.log(accessToken + "is the new access token")
                res.json({ accessToken } );
            }

        } catch (err) {
            res.sendStatus(403);
        }
    } else {
        res.sendStatus(401);
    }
});

loginRouter.get('/token/verify', isAuthenticated, (req, res) => {
    res.sendStatus(200);
});