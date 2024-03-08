import express from "express";
import * as utils from "./routerUtils";
import {Tasklist} from "../ts-interfaces/model/Tasklist";
import {StatusCodes} from "http-status-codes";
import {ConnectionToDatabaseLostError} from "../ts-interfaces/errors/ConnectionToDatabaseLostError";
import {DateFormatError} from "../ts-interfaces/errors/DateFormatError";

export const tasklistRouter = express.Router();

tasklistRouter.get("/", (req, res) => {
    res.status(200).send("Hello World! from tasklist-router");
});
tasklistRouter.post("/:userID", (req, res) => {
    const userID = parseInt(req.params.userID);
    if (userID === undefined || isNaN(userID) || userID <= 0){
        res.status(400).send("userID must be a positive number");
        return;
    }
    if (utils.checkIfFalseTitle(req.body.title)){
        res.status(400).send("title must be at least 1 character long");
        return;
    }
    const title = req.body.title;
    const description = req.body.description ?? "";
    const sortingOrder = req.body.sortingOrder ?? 1;
    const priority = req.body.priority ?? 1;
    if (utils.checkIfFalseSortingOrder(sortingOrder)){
        res.status(StatusCodes.BAD_REQUEST).send("sortingOrder must be a positive number");
        return;
    }
    if (utils.checkIfFalsePriority(priority)){
        res.status(StatusCodes.BAD_REQUEST).send("priority must be a positive number");
        return;
    }
    const result : Tasklist = {
        tasklistID: 1,
        title: title,
        description: description,
        sortingOrder: sortingOrder,
        priority: priority,
        isLocked: false,
        ownerID: userID
    };
    try {
        //insertTask(database: sqlite3.Database, title: string, dueDate: string, description: string, priority: byte, tasklistID: number): void
        //throws ConnectionToDatabaseLostError
        //throws DateFormatError
        //throws DateExpiredError
        //throws IdNotFoundError (variablename)
        //throws StringToLongError  (variablename)
    } catch (err){
        if (err instanceof ConnectionToDatabaseLostError){
            res.status(StatusCodes.INTERNAL_SERVER_ERROR).send("Database connection lost");
            return;
        }
        if (err instanceof DateFormatError){
            res.status(StatusCodes.BAD_REQUEST).send("Date format is incorrect");
            return;
        }
        if (err instanceof DateExpiredError){
            res.status(StatusCodes.BAD_REQUEST).send("Date is expired");
            return;
        }

    }
    res.status(StatusCodes.CREATED).json(result);
    return;
});