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
        res.status(StatusCodes.BAD_REQUEST).send("tasklistID must be a positive number");
        return;
    }
    try {
        const tasks: Task[] = await selectTasksByTasklistID(tasklistID);
        res.status(StatusCodes.OK).send(tasks);
    } catch(err) {
        if (err instanceof IdNotFoundError) {
            res.status(StatusCodes.BAD_REQUEST).send("No user found");
        }
    }
});

taskRouter.post("/:tasklistID", /*isAuthenticated,*/ async (req, res) => {
    const tasklistID = parseInt(req.params.tasklistID);
    if (tasklistID === undefined || isNaN(tasklistID) || tasklistID < 1) {
        res.status(StatusCodes.BAD_REQUEST).send("userID must be a positiv Number");
        return;
    }

    if (!utils.checkTitle(req.body.title)) {
        res.status(StatusCodes.BAD_REQUEST).send("title must be at least 1 character long");
        return;
    }
    const dueDate = req.body.dueDate;
    // if (dueDate === undefined || Date.parse(dueDate) === NaN! ){
    //     res.status(StatusCodes.BAD_REQUEST).send("date must lie in the future! and have the format dd.mm.yyyy")
    //     return;
    // }
    const title = req.body.title;
    const description = req.body.description ?? "";
    const sortingOrder = req.body.sortingOrder ?? 1;
    const priority = req.body.priority ?? 1;
    if (!utils.checkSortingOrder(sortingOrder)) {
        res.status(StatusCodes.BAD_REQUEST).send("sortingOrder must be a positive number");
        return;
    }
    if (!utils.checkPriority(priority)) {
        res.status(StatusCodes.BAD_REQUEST).send("priority must be a positive number");
        return;
    }
    const result: Task = {
            taskID: 1,
            title: title,
            dueDate: dueDate,
            priority: priority,
            description: description,
            isComplete: 0,
            tasklistID: tasklistID
    };
    try {
        result.taskID = await insertTask(result.title, result.description, result.dueDate, result.priority, result.tasklistID, 'luca.stinkt@hodenkobold.com');
        res.status(StatusCodes.CREATED).send(result);
    } catch(err) {
        if (err instanceof DateExpiredError) {
            res.status(StatusCodes.BAD_REQUEST).send("Date already was!");
        } else if (err instanceof IdNotFoundError) {
            res.status(StatusCodes.BAD_REQUEST).send("wrongID: " + err.message);
        } else if (err instanceof DateFormatError) {
            res.status(StatusCodes.BAD_REQUEST).send("Date is wrong format!")
        } else if (err instanceof StringToLongError) {
            res.status(StatusCodes.BAD_REQUEST).send(err.message);
        } else if (err instanceof NotAValidNumberError) {
            res.status(StatusCodes.BAD_REQUEST).send("Number was not in a valid range!");
        }
    }
});

taskRouter.put("/:taskID", isAuthenticated, async (req, res) => {
    const taskID = parseInt(req.params.taskID);
    if (taskID === undefined || isNaN(taskID) || taskID < 1) {
        res.status(StatusCodes.BAD_REQUEST).send("taskID must be a positiv Number");
        return;
    }
    try {
        await updateTask(taskID, req.body.tasklistID, req.body.title, req.body.description, req.body.dueDate, req.body.priority, req.body.isComplete);
        res.status(StatusCodes.OK).send(await selectTaskByTaskID(taskID));
    } catch(err: any) {
        if (err instanceof DateExpiredError) {
            res.status(StatusCodes.BAD_REQUEST).send("Date already was!");
        } else if (err instanceof IdNotFoundError) {
            res.status(StatusCodes.BAD_REQUEST).send("NO task found");
        } else if (err instanceof DateFormatError) {
            res.status(StatusCodes.BAD_REQUEST).send("Date is wrong format!")
        } else if (err instanceof StringToLongError) {
            res.status(StatusCodes.BAD_REQUEST).send(err.message);
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
            res.status(StatusCodes.BAD_REQUEST).send("NO task found");
        }
    }
});

