import express from "express";
import {StatusCodes} from "http-status-codes";
import {connectToDatabase} from "../database-functions/connect";
import bcrypt from "bcrypt";
import {User} from "../interfaces/model/User";
import {selectUserByEmail, selectUserByUserID} from "../database-functions/select-data";
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
    try{
        bcrypt.hash(req.body.password, 10).then(async hashedPassword => {
            const user: User = {
                username: req.body.username,
                hashedPassword: hashedPassword,
                email: req.body.email
            };
            if (user.username === "" || user.email === "" || user.hashedPassword === "") {
                throw new Error("Invalid input");
            }
            if (await selectUserByEmail(connectToDatabase(), user.email)) {
                throw new Error("User already exists");
            }
            // insert user into database

            res.status(StatusCodes.CREATED).send("User created successfully");
        });
    }catch (e) {
        res.status(StatusCodes.BAD_REQUEST).send("Invalid email or password");
    }
});
