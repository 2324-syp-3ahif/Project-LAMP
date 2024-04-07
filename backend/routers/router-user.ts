import express from "express";
import {StatusCodes} from "http-status-codes";
import {checkMailFormat, checkPasswordFormat, checkStringFormat} from "../utils";
import {db} from "../app";
import {selectUserByEmail} from "../database-functions/select-data";
import {IdNotFoundError} from "../interfaces/errors/IdNotFoundError";
import {deleteTagByID, deleteUserByEmail} from "../database-functions/delete-data";
import {insertUser} from "../database-functions/insert-data";
import {IdAlreadyExistsError} from "../interfaces/errors/IdAlreadyExistsError";
import {updateUser} from "../database-functions/update-data";

export const userRouter = express.Router();

userRouter.get("/:email", async (req, res) => {
   const email = req.params.email;
    if (!checkMailFormat(email)) {
         res.status(StatusCodes.BAD_REQUEST).send("email must be a valid email address");
         return;
    }
    selectUserByEmail(db, email).then(user => {
        res.status(StatusCodes.OK).send(user);
    }).catch((err: Error) => {
        if (err instanceof IdNotFoundError) {
            res.status(StatusCodes.BAD_REQUEST).send("NO user found");
        }
    });
});

userRouter.post("/:email", async (req, res) => {
    const email = req.params.email;
    if (!checkMailFormat(email)) {
        res.status(StatusCodes.BAD_REQUEST).send("email must be a valid email address");
        return;
    }
    if (req.body.username === undefined || !checkStringFormat(req.body.username)) {
        res.status(StatusCodes.BAD_REQUEST).send("username must be a string and between 1 and 50 characters long");
        return;
    }
    if (req.body.password === undefined || !checkPasswordFormat(req.body.password)) {
        res.status(StatusCodes.BAD_REQUEST).send("password wrong format");
        return;
    }
    const user = {
        email: email,
        name: req.body.username,
        password: req.body.password
    }
    insertUser(db, email, user.name, user.password).then(() => {
        res.status(StatusCodes.CREATED).send(user);
    }).catch((err) => {
        if (err instanceof IdNotFoundError) {
            res.status(StatusCodes.BAD_REQUEST).send("NO user found");
        }
        if (err instanceof IdAlreadyExistsError) {
            res.status(StatusCodes.BAD_REQUEST).send("there is already a User with this email");
        }
    });
});

userRouter.put("/:email", async (req, res) => {
    const email = req.params.email;
    if (!checkMailFormat(email)) {
        res.status(StatusCodes.BAD_REQUEST).send("email must be a valid email address");
        return;
    }
    selectUserByEmail(db, email).then(user => {
        if (req.body.username !== undefined && checkStringFormat(req.body.username)) {
            user.username = req.body.username;
        }
        if (req.body.password !== undefined && checkPasswordFormat(req.body.password)) {
            user.hashedPassword = req.body.password;
        }
        updateUser(db, user.email, user.username, user.hashedPassword).then(() => {
            res.status(StatusCodes.OK).send(user);
        }).catch((err) => {
            if (err instanceof IdNotFoundError) {
                res.status(StatusCodes.BAD_REQUEST).send("NO user found");
            }
        });
    }).catch((err) => {
        if (err instanceof IdNotFoundError) {
            res.status(StatusCodes.BAD_REQUEST).send("NO user found");
        }
    });
});

userRouter.delete("/:email", async (req, res) => {
    const email = req.params.email;
    if (!checkMailFormat(email)) {
        res.status(StatusCodes.BAD_REQUEST).send("email must be a valid email address");
        return;
    }
    deleteUserByEmail(db, email).then(() => {
        res.status(StatusCodes.OK).send("User deleted");
    }).catch((err) => {
        if (err instanceof IdNotFoundError) {
            res.status(StatusCodes.BAD_REQUEST).send("NO user found");
        }
    });
});