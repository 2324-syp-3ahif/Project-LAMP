import express from "express";
import * as utils from "./routerUtils";
import {Tasklist} from "../interfaces/model/Tasklist";
import {StatusCodes} from "http-status-codes";
import {ConnectionToDatabaseLostError} from "../interfaces/errors/ConnectionToDatabaseLostError";
import {DateFormatError} from "../interfaces/errors/DateFormatError";
import {insertTask} from "../database-functions/insert-data";
import {db} from "../app";
import {DateExpiredError} from "../interfaces/errors/DateExpiredError";
import {IdNotFoundError} from "../interfaces/errors/IdNotFoundError";
import {StringToLongError} from "../interfaces/errors/StringToLongError";


export const tasklistRouter = express.Router();

tasklistRouter.get("/", (req, res) => {
    res.status(200).send("Hello World! from tasklist-router");
});
tasklistRouter.post("/:userID",
    (req, res) => {
        const userID = parseInt(req.params.userID);
        if (userID === undefined || isNaN(userID) || userID <= 0) {
            res.status(StatusCodes.BAD_REQUEST).send("userID must be a positive number");
            return;
        }
        if (utils.checkIfFalseTitle(req.body.title)) {
            res.status(StatusCodes.BAD_REQUEST).send("title must be at least 1 character long");
            return;
        }
        const title = req.body.title;
        const description = req.body.description ?? "";
        const sortingOrder = req.body.sortingOrder ?? 1;
        const priority = req.body.priority ?? 1;
        if (utils.checkIfFalseSortingOrder(sortingOrder)) {
            res.status(StatusCodes.BAD_REQUEST).send("sortingOrder must be a positive number");
            return;
        }
        if (utils.checkIfFalsePriority(priority)) {
            res.status(StatusCodes.BAD_REQUEST).send("priority must be a positive number");
            return;
        }
        const result: Tasklist = {
            tasklistID: 1,
            title: title,
            description: description,
            sortingOrder: sortingOrder,
            priority: priority,
            isLocked: false,
            ownerID: userID
        };
        try {
            insertTask(db, result.title, new Date(), result.description, result.priority, result.tasklistID, result.ownerID);
        } catch (err) {
            if (err instanceof ConnectionToDatabaseLostError) {
                res.status(StatusCodes.INTERNAL_SERVER_ERROR).send("Database connection lost");
                return;
            }
            if (err instanceof DateFormatError) {
                res.status(StatusCodes.BAD_REQUEST).send("Date format is incorrect");
                return;
            }
            if (err instanceof DateExpiredError) {
                res.status(StatusCodes.BAD_REQUEST).send("Date is expired");
                return;
            }
            if (err instanceof IdNotFoundError) {
                res.status(StatusCodes.BAD_REQUEST).send("UserID not found: " + err.message);
                return;
            }
            if (err instanceof StringToLongError) {
                res.status(StatusCodes.BAD_REQUEST).send("String is too long: " + err.message);
            }
            res.status(StatusCodes.CREATED).json(result);
            return;
        }
    });