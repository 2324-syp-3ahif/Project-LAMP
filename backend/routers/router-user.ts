import express from "express";
import {StatusCodes} from "http-status-codes";
import {checkMailFormat, checkPasswordFormat, checkStringFormat} from "../utils";
import {selectUserByEmail, deleteUserByEmail, insertUser, updateUser} from "../database-functions/user-functions";
import {IdNotFoundError} from "../interfaces/errors/IdNotFoundError";
import {IdAlreadyExistsError} from "../interfaces/errors/IdAlreadyExistsError";
import {isAuthenticated} from "../middleware/auth-handlers";

export const userRouter = express.Router();

userRouter.get("/:email", isAuthenticated, async (req, res) => {
   const email = req.params.email;
    if (!checkMailFormat(email)) {
         res.status(StatusCodes.BAD_REQUEST).send("The email must be valid.");
         return;
    }
    selectUserByEmail(email).then(user => {
        res.status(StatusCodes.OK).send(user);
    }).catch((err: Error) => {
        if (err instanceof IdNotFoundError) {
            res.status(StatusCodes.BAD_REQUEST).send("No user found");
        }
    });
});

userRouter.post("/:email", isAuthenticated, async (req, res) => {
    const email = req.params.email;
    if (!checkMailFormat(email)) {
        res.status(StatusCodes.BAD_REQUEST).send("The email must be valid.");
        return;
    }
    if (req.body.username === undefined || !checkStringFormat(req.body.username)) {
        res.status(StatusCodes.BAD_REQUEST).send("The username must be a string and between 1 and 50 characters long.");
        return;
    }
    if (req.body.password === undefined || !checkPasswordFormat(req.body.password)) {
        res.status(StatusCodes.BAD_REQUEST).send("The password is in a wrong format.");
        return;
    }
    const user = {
        email: email,
        name: req.body.username,
        password: req.body.password
    }
    insertUser(email, user.name, user.password).then(() => {
        res.status(StatusCodes.CREATED).send(user);
    }).catch((err) => {
        if (err instanceof IdNotFoundError) {
            res.status(StatusCodes.BAD_REQUEST).send("No user found.");
        }
        if (err instanceof IdAlreadyExistsError) {
            res.status(StatusCodes.BAD_REQUEST).send("There already is a user with this email.");
        }
    });
});

userRouter.put("/:email", isAuthenticated, async (req, res) => {
    const email = req.params.email;
    if (!checkMailFormat(email)) {
        res.status(StatusCodes.BAD_REQUEST).send("The email must be a valid email address");
        return;
    }
    selectUserByEmail(email).then(user => {
        if (req.body.username !== undefined && checkStringFormat(req.body.username)) {
            user.username = req.body.username;
        }
        if (req.body.password !== undefined && checkPasswordFormat(req.body.password)) {
            user.hashedPassword = req.body.password;
        }
        updateUser(user.email, user.hashedPassword).then(() => {
            res.status(StatusCodes.OK).send(user);
        }).catch((err) => {
            if (err instanceof IdNotFoundError) {
                res.status(StatusCodes.BAD_REQUEST).send("No user found.");
            }
        });
    }).catch((err) => {
        if (err instanceof IdNotFoundError) {
            res.status(StatusCodes.BAD_REQUEST).send("No user found.");
        }
    });
});
userRouter.patch("/resetPassword", async (req, res) => {
   const {email, password} = req.body;
   await updateUser(email, password);
   res.status(StatusCodes.OK).send("Password updated");
});

userRouter.delete("/:email", isAuthenticated, async (req, res) => {
    const email = req.params.email;
    if (!checkMailFormat(email)) {
        res.status(StatusCodes.BAD_REQUEST).send("email must be a valid email address");
        return;
    }
    deleteUserByEmail(email).then(() => {
        res.status(StatusCodes.OK).send("User deleted");
    }).catch((err) => {
        if (err instanceof IdNotFoundError) {
            res.status(StatusCodes.BAD_REQUEST).send("No user found");
        }
    });
});