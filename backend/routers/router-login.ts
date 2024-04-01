import express from "express";
import {StatusCodes} from "http-status-codes";
import {connectToDatabase} from "../database-functions/connect";
import bcrypt from "bcrypt";
import {User} from "../interfaces/model/User";
import {selectUserByEmail} from "../database-functions/select-data";
import {insertUser, idFound} from "../database-functions/insert-data";
export const loginRouter = express.Router();

loginRouter.post("/login", async (req, res) => {
    console.log(req.body)
    const email = req.body.email;
    const password = req.body.password;
    // check if email and password are valid
    selectUserByEmail(connectToDatabase() ,email).then(async user => {
        if (await bcrypt.compare(password, user.hashedPassword)) {
            res.status(StatusCodes.OK).send("User logged in successfully");
        } else {
            res.status(StatusCodes.BAD_REQUEST).send("Invalid email or password");
        }
    });
});
loginRouter.post("/register", async (req, res) => {
    console.log("hallo")
    try{
        await insertUser(connectToDatabase(), req.body.email, req.body.username, req.body.password);
        res.sendStatus(StatusCodes.OK);
    } catch (e){
        res.sendStatus(StatusCodes.BAD_REQUEST);
    }
});
