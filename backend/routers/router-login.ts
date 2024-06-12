import express from "express";
import {JwtPayload} from "jsonwebtoken";
import {StatusCodes} from "http-status-codes";
import bcrypt from "bcrypt";
import {selectUserByEmail, insertUser} from "../database-functions/user-functions";
import dotenv from "dotenv";
import {generateTokens, verifyToken} from "./tokenUtils";
import {isAuthenticated} from "../middleware/auth-handlers";
import { IdAlreadyExistsError } from '../interfaces/errors/IdAlreadyExistsError';
import {generateRandomVerificationCode, sendVerificationMail} from "../repositories/mail-repo";
import {IdNotFoundError} from "../interfaces/errors/IdNotFoundError";

dotenv.config();
export const loginRouter = express.Router();

loginRouter.post("/login", async (req, res) => {
    try {
        const user = await selectUserByEmail(req.body.email);
        if (user && !await bcrypt.compare(req.body.password, user.hashedPassword)) {
            res.status(StatusCodes.UNAUTHORIZED).send("Wrong password!");
            return;
        }

        const { accessToken, refreshToken } = generateTokens(user);
        res.cookie('refreshToken', refreshToken, { httpOnly: true, path: '/api/token/refresh' });
        res.json({ accessToken });
    } catch (e) {
        if (e instanceof IdNotFoundError) {
            res.status(StatusCodes.NOT_FOUND).send("ID was not found");
        } else {
            res.status(StatusCodes.INTERNAL_SERVER_ERROR).send("An error occurred during login.");
        }
    }
});

loginRouter.post("/register", async (req, res) => {
    try {
        await insertUser(req.body.email, req.body.username, req.body.password);
        const user = await selectUserByEmail(req.body.email);
        const { accessToken, refreshToken } = generateTokens(user);
        res.cookie('refreshToken', refreshToken, { httpOnly: true, path: '/api/token/refresh' });
        res.status(StatusCodes.CREATED).json({ accessToken });
    } catch (e) {
        if (e instanceof IdAlreadyExistsError) {
            res.status(StatusCodes.BAD_REQUEST).send("ID already exists.");
        } else {
            res.status(StatusCodes.INTERNAL_SERVER_ERROR).send("An error occurred during registration.");
        }
    }
});

loginRouter.post("/resetPassword/mail", async (req, res) => {
   const email = req.body.email;
   try {
       const user = await selectUserByEmail(email);
       if (user) {
           const code = generateRandomVerificationCode();
           sendVerificationMail(email, code);
           res.status(StatusCodes.OK).json({code});
       } else {
           res.status(StatusCodes.NOT_FOUND).send("User not found.");
       }
   } catch(err) {
       res.status(StatusCodes.NOT_FOUND).send("User not found.");
       return;
   }
});

loginRouter.post('/token/refresh', async (req, res) => {
    const refreshToken = req.cookies.refreshToken;
    if (refreshToken) {
        try {
            const user = verifyToken(refreshToken, process.env.REFRESH_TOKEN_SECRET as string) as JwtPayload;
            if (user){
                const { accessToken } = generateTokens({ username: user.username, email: user.email });
                res.json({ accessToken } );
            }
        } catch (err) {
            res.sendStatus(StatusCodes.FORBIDDEN);
        }
    } else {
        res.sendStatus(StatusCodes.UNAUTHORIZED);
    }
});
loginRouter.get('/token/verify', isAuthenticated, (_, res) => {
    res.sendStatus(StatusCodes.OK);
});