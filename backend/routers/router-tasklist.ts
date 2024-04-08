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
import {selectTaskByTaskID, selectTasklistsByEmail, selectTasksByTasklistID} from "../database-functions/select-data";
import {NotAValidNumberError} from "../interfaces/errors/NotAValidNumberError";
import {getMaxId} from "../database-functions/select-data";
import {Task} from "../interfaces/model/Task";
import {updateTask, updateTasklist} from "../database-functions/update-data";
import {deleteTaskByID, deleteTasklistByID} from "../database-functions/delete-data";


export const tasklistRouter = express.Router();

tasklistRouter.get("/:email", (req, res) => {
    const email = req.params.email;
    console.log("email: " + email);

    if (!checkMailFormat(email)) {
        console.log("email not valid");
        res.status(StatusCodes.BAD_REQUEST).send("email must be a valid email address");
        return;
    }
    console.log("email valid");
    selectTasklistsByEmail(db, email).then(tasks => {
        console.log("in db");
        res.status(StatusCodes.OK).send(tasks);
    }).catch((err) => {
        console.log(err);
        if (err instanceof IdNotFoundError) {
            res.status(StatusCodes.BAD_REQUEST).send("No user found");
        }
    })
});

tasklistRouter.post("/:email", async (req, res) => {
    const email = req.params.email;
    if (!checkMailFormat(email)) {
        res.status(StatusCodes.BAD_REQUEST).send("email must be a valid email address");
        return;
    }

    const tasklist: Tasklist = {
        tasklistID: await getMaxId(db, 'TASKLISTS', 'tasklistID') + 1,
        title: req.body.title,
        description: req.body.description ?? "",
        priority: req.body.priority ?? 1,
        isLocked: false,
        sortingOrder: req.body.sortingOrder ?? 1,
        email: email
    }

    if (!utils.checkTitle(tasklist.title)) {
        res.status(StatusCodes.BAD_REQUEST).send("title must be at least 1 character long");
        return;
    }
    if (!utils.checkSortingOrder(tasklist.sortingOrder)) {
        res.status(StatusCodes.BAD_REQUEST).send("sortingOrder must be a positive number");
        return;
    }
    if (!utils.checkPriority(tasklist.priority)) {
        res.status(StatusCodes.BAD_REQUEST).send("priority must be a positive number");
    }

    insertTasklist(db, tasklist.title, tasklist.description, tasklist.priority, tasklist.isLocked, tasklist.sortingOrder, tasklist.email).then(() => {
        selectTasklistsByEmail(db, email).then(t => {
            res.status(StatusCodes.CREATED).send(tasklist);
        }).catch((err) => {
            if (err instanceof IdNotFoundError) {
                res.status(StatusCodes.BAD_REQUEST).send("No user found");
            }
        })
    }).catch((err) => {
        if (err instanceof ConnectionToDatabaseLostError) {
            res.status(StatusCodes.INTERNAL_SERVER_ERROR).send("Database connection lost");
        }
    })
});

tasklistRouter.put("/:email/:tasklistID", async (req, res) => {
    const tasklistID = parseInt(req.params.tasklistID);
    const email = req.params.email;

    if (tasklistID === undefined || isNaN(tasklistID) || tasklistID < 1) {
        res.status(StatusCodes.BAD_REQUEST).send("userID must be a positiv Number");
        return;
    }
    if (!checkMailFormat(email)) {
        res.status(StatusCodes.BAD_REQUEST).send("email must be a valid email address");
        return;
    }
    selectTasklistsByEmail(db, email).then((tasklists: Tasklist[]) => {
        const tasklist = tasklists.find(tasklist => tasklist.tasklistID === tasklistID);
        if ( tasklist === undefined) {
            res.status(StatusCodes.BAD_REQUEST).send("tasklistID not found");
            return;
        }

        tasklist.title = req.body.title ?? tasklist.title;
        tasklist.description = req.body.description ?? tasklist.description;
        tasklist.sortingOrder = req.body.sortingOrder ?? tasklist.sortingOrder;
        tasklist.priority = req.body.priority ?? tasklist.priority;
        if (req.body.isLocked !== undefined && typeof req.body.isLocked === "boolean") {
            tasklist.isLocked = req.body.isLocked;
        }
        if (!utils.checkTitle(tasklist.title)) {
            res.status(StatusCodes.BAD_REQUEST).send("title must be at least 1 character long");
            return;
        }
        if (!utils.checkSortingOrder(tasklist.sortingOrder)) {
            res.status(StatusCodes.BAD_REQUEST).send("sortingOrder must be a positive number");
            return;
        }
        if (!utils.checkPriority(tasklist.priority)) {
            res.status(StatusCodes.BAD_REQUEST).send("priority must be a positive number");
            return;
        }

        updateTasklist(db, tasklistID, tasklist.title, tasklist.description, tasklist.sortingOrder, tasklist.priority, tasklist.isLocked).then(() => {
            res.status(StatusCodes.OK).send(tasklist);
        }).catch((err: Error) => {
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
        });
    }).catch((err: Error) => {
        if (err instanceof IdNotFoundError) {
            res.status(StatusCodes.BAD_REQUEST).send("No tasklist found");
        }
    });
});

tasklistRouter.delete("/:tasklistID", async (req, res) => {
    const tasklistID = parseInt(req.params.tasklistID);
    if (tasklistID === undefined || isNaN(tasklistID) || tasklistID < 1) {
        res.status(StatusCodes.BAD_REQUEST).send("tasklistID must be a positiv Number");
        return;
    }

    await deleteTasklistByID(db, tasklistID).then(() => {
        res.status(StatusCodes.OK).send("Tasklist deleted");
    }).catch((err: Error) => {
        if (err instanceof IdNotFoundError) {
            res.status(StatusCodes.BAD_REQUEST).send("NO tasklist found");
        }
    });
});