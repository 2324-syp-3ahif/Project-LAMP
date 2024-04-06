import express from "express";
import * as utils from "./routerUtils";
import {Tasklist} from "../interfaces/model/Tasklist";
import {StatusCodes} from "http-status-codes";
import {ConnectionToDatabaseLostError} from "../interfaces/errors/ConnectionToDatabaseLostError";
import {DateFormatError} from "../interfaces/errors/DateFormatError";
import {insertTask, insertTasklist} from "../database-functions/insert-data";
import {db} from "../app";
import {DateExpiredError} from "../interfaces/errors/DateExpiredError";
import {IdNotFoundError} from "../interfaces/errors/IdNotFoundError";
import {StringToLongError} from "../interfaces/errors/StringToLongError";
import {checkMailFormat} from "../utils";
import {selectTasklistsByEmail, selectTasksByTasklistID} from "../database-functions/select-data";
import {NotAValidNumberError} from "../interfaces/errors/NotAValidNumberError";
import {getMaxId} from "../database-functions/select-data";


export const tasklistRouter = express.Router();

tasklistRouter.get("/:email", (req, res) => {
    const email = req.params.email;
    if (!checkMailFormat(email)) {
        res.status(StatusCodes.BAD_REQUEST).send("email must be a valid email address");
        return;
    }
    selectTasklistsByEmail(db, email).then(tasks => {
        res.status(StatusCodes.OK).send(tasks);
    }).catch((err) => {
        if (err instanceof IdNotFoundError) {
            res.status(StatusCodes.BAD_REQUEST).send("NO user found");
        }
    })
});

tasklistRouter.post("/:email", async (req, res) => {
    const email = req.params.email;
    if (!checkMailFormat(email)) {
        res.status(StatusCodes.BAD_REQUEST).send("email must be a valid email address");
        return;
    }

    const title = req.body.title;
    const description = req.body.description ?? "";
    const sortingOrder = req.body.sortingOrder ?? 1;
    const priority = req.body.priority ?? 1;

    if (!utils.checkTitle(req.body.title)) {
        res.status(StatusCodes.BAD_REQUEST).send("title must be at least 1 character long");
        return;
    }
    if (!utils.checkSortingOrder(sortingOrder)) {
        res.status(StatusCodes.BAD_REQUEST).send("sortingOrder must be a positive number");
        return;
    }
    if (!utils.checkPriority(priority)) {
        res.status(StatusCodes.BAD_REQUEST).send("priority must be a positive number");
    }

    insertTasklist(db, title, description, priority, false, sortingOrder, email).then(() => {
        selectTasklistsByEmail(db, email).then(tasks => {
            res.status(StatusCodes.OK).send(tasks);
        }).catch((err) => {
            if (err instanceof IdNotFoundError) {
                res.status(StatusCodes.BAD_REQUEST).send("NO user found");
            }
        })
    }).catch((err) => {
        if (err instanceof ConnectionToDatabaseLostError) {
            res.status(StatusCodes.INTERNAL_SERVER_ERROR).send("Database connection lost");
        }
    })
});