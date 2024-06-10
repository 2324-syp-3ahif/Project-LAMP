import express from "express";
import * as utils from "./routerUtils";
import {selectTasksByTasklistID, insertTask, selectTaskByTaskID, updateTask, deleteTaskByTaskID} from "../database-functions/task-functions";
import {IdNotFoundError} from "../interfaces/errors/IdNotFoundError";
import {DateExpiredError} from "../interfaces/errors/DateExpiredError";
import {DateFormatError} from "../interfaces/errors/DateFormatError";
import {StringToLongError} from "../interfaces/errors/StringToLongError";
import {NotAValidNumberError} from "../interfaces/errors/NotAValidNumberError";
import {StatusCodes} from "http-status-codes";
import {Task} from "../interfaces/model/Task";
import {isAuthenticated} from "../middleware/auth-handlers";

export const taskRouter = express.Router();

taskRouter.get("/tasklistID/:tasklistID", isAuthenticated, async (req, res) => {
    const tasklistID = parseInt(req.params.tasklistID);
    if (tasklistID === undefined || isNaN(tasklistID) || tasklistID < 1) {
        res.status(StatusCodes.BAD_REQUEST).send("TasklistID must be a positive number.");
        return;
    }
    try {
        const tasks: Task[] = await selectTasksByTasklistID(tasklistID);
        res.status(StatusCodes.OK).send(tasks);
    } catch(err) {
        if (err instanceof IdNotFoundError) {
            res.status(StatusCodes.BAD_REQUEST).send("No user found.");
        }
    }
});

taskRouter.post("/:tasklistID", /*isAuthenticated,*/ async (req, res) => {
    for (const key in req.body) {
        if (!req.body.hasOwnProperty(key) || req.body[key] === undefined) {
            console.log(`${key}: ${req.body[key]}`);
            res.status(400).send("Wrong input format.");
        } else {
            console.log(`${key}: ${req.body[key]}`);
        }
    }
    try {
        const result = await insertTask(
            req.body.title,
            req.body.description,
            Date.parse(req.body.dueDate),
            parseInt(req.body.priority),
            parseInt(req.params.tasklistID),
            req.body.email
        );
        res.sendStatus(StatusCodes.CREATED).send(result);
    } catch(err) {
        if (err instanceof DateExpiredError) {
            res.status(StatusCodes.BAD_REQUEST).send("Date already was!");
        } else if (err instanceof IdNotFoundError) {
            res.status(StatusCodes.BAD_REQUEST).send("Wrong ID");
        } else if (err instanceof DateFormatError) {
            res.status(StatusCodes.BAD_REQUEST).send("Date is wrong format!")
        } else if (err instanceof StringToLongError) {
            res.status(StatusCodes.BAD_REQUEST).send("String was too long!");
        } else if (err instanceof NotAValidNumberError) {
            res.status(StatusCodes.BAD_REQUEST).send("Number was not in a valid range!");
        }
    }
});

taskRouter.put("/:taskID", isAuthenticated, async (req, res) => {
    const taskID = parseInt(req.params.taskID);
    if (taskID === undefined || isNaN(taskID) || taskID < 1) {
        res.status(StatusCodes.BAD_REQUEST).send("TaskID must be a positive number");
        return;
    }
    try {
        await updateTask(taskID, req.body.tasklistID, req.body.title, req.body.description, req.body.dueDate, req.body.priority, req.body.isComplete);
        res.status(StatusCodes.OK).send(await selectTaskByTaskID(taskID));
    } catch(err: any) {
        if (err instanceof DateExpiredError) {
            res.status(StatusCodes.BAD_REQUEST).send("Date already was!");
        } else if (err instanceof IdNotFoundError) {
            res.status(StatusCodes.BAD_REQUEST).send("No task found");
        } else if (err instanceof DateFormatError) {
            res.status(StatusCodes.BAD_REQUEST).send("Date is wrong format!")
        } else if (err instanceof StringToLongError) {
            res.status(StatusCodes.BAD_REQUEST).send("String was too long!");
        } else if (err instanceof NotAValidNumberError) {
            res.status(StatusCodes.BAD_REQUEST).send("Number was not in a valid range!");
        }
    }
});

taskRouter.delete("/:taskID", isAuthenticated, async (req, res) => {
    const taskID = parseInt(req.params.taskID);
    if (taskID === undefined || isNaN(taskID) || taskID < 1) {
        res.status(StatusCodes.BAD_REQUEST).send("taskID must be a positive Number");
        return;
    }
    try {
        await deleteTaskByTaskID(taskID);
        res.status(StatusCodes.OK).send("Task deleted");
    } catch(err) {
        if (err instanceof IdNotFoundError) {
            res.status(StatusCodes.BAD_REQUEST).send("No task found");
        }
    }
});

