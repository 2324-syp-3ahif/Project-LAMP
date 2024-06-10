import express from "express";
import * as utils from "./routerUtils";
import {Tasklist} from "../interfaces/model/Tasklist";
import {StatusCodes} from "http-status-codes";
import {DateFormatError} from "../interfaces/errors/DateFormatError";
import {
    insertTasklist,
    selectTasklistsByEmail,
    updateTasklist,
    deleteTasklistByTasklistID,
    selectTasklistByTasklistID
} from "../database-functions/tasklist-functions";
import {DateExpiredError} from "../interfaces/errors/DateExpiredError";
import {IdNotFoundError} from "../interfaces/errors/IdNotFoundError";
import {StringToLongError} from "../interfaces/errors/StringToLongError";
import {checkMailFormat} from "../utils";
import {NotAValidNumberError} from "../interfaces/errors/NotAValidNumberError";
import {isAuthenticated} from "../middleware/auth-handlers";
import {getCollaboratorCount} from "../database-functions/usertaklist-functions";

export const tasklistRouter = express.Router();

tasklistRouter.get("/email/:email", isAuthenticated, async (req, res) => {
    const email = req.params.email;
    if (!checkMailFormat(email)) {
        res.status(StatusCodes.BAD_REQUEST).send("email must be a valid email address");
        return;
    }
    try {
        const tasklists: Tasklist[] = await selectTasklistsByEmail(email);
        res.status(StatusCodes.OK).send(tasklists);
    } catch(err) {
        if (err instanceof IdNotFoundError) {
            res.status(StatusCodes.BAD_REQUEST).send("No user found");
        }
    }
});
tasklistRouter.get("/collaborators/count/:tasklistID", isAuthenticated, async (req, res) => {
    const tasklistID = parseInt(req.params.tasklistID);
    const collaboratorIDs = await getCollaboratorCount(tasklistID);
    res.status(StatusCodes.OK).send(collaboratorIDs);
});

tasklistRouter.post("/:email", isAuthenticated, async (req, res) => {
    if (!checkMailFormat(req.params.email)) {
        res.status(StatusCodes.BAD_REQUEST).send("email must be a valid email address");
        return;
    }

    if (!utils.checkTitle(req.body.title)) {
        res.status(StatusCodes.BAD_REQUEST).send("title must be at least 1 character long");
        return;
    }
    if (!utils.checkSortingOrder(req.body.sortingOrder)) {
        res.status(StatusCodes.BAD_REQUEST).send("sortingOrder must be a positive number");
        return;
    }
    if (!utils.checkPriority(req.body.priority)) {
        res.status(StatusCodes.BAD_REQUEST).send("priority must be a positive number");
    }

    try {
        const tasklistID: number = await insertTasklist(req.body.title, req.body.description, req.body.priority, req.body.sortingOrder, req.body.email);
        res.status(StatusCodes.OK).send(await selectTasklistByTasklistID(tasklistID));
    } catch(err) {
        if (err instanceof Error) {
            res.status(StatusCodes.BAD_REQUEST).send("An error occurred during the creation of the tasklist.");
        }
    }
});

tasklistRouter.put("/:email/:tasklistID", isAuthenticated, async (req, res) => {
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
    selectTasklistsByEmail(email).then((tasklists: Tasklist[]) => {
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
            res.status(StatusCodes.BAD_REQUEST).send("The title must be at least 1 character long");
            return;
        }
        if (!utils.checkSortingOrder(tasklist.sortingOrder)) {
            res.status(StatusCodes.BAD_REQUEST).send("The sortingOrder must be a positive number");
            return;
        }
        if (!utils.checkPriority(tasklist.priority)) {
            res.status(StatusCodes.BAD_REQUEST).send("The priority must be a positive number");
            return;
        }

        updateTasklist(tasklistID, tasklist.title, tasklist.description, tasklist.sortingOrder, tasklist.priority, tasklist.isLocked).then(() => {
            res.status(StatusCodes.OK).send(tasklist);
        }).catch((err: Error) => {
            if (err instanceof DateExpiredError) {
                res.status(StatusCodes.BAD_REQUEST).send("Date is in the past!");
            } else if (err instanceof IdNotFoundError) {
                res.status(StatusCodes.BAD_REQUEST).send("ID was not found");
            } else if (err instanceof DateFormatError) {
                res.status(StatusCodes.BAD_REQUEST).send("Date is in a wrong format!")
            } else if (err instanceof StringToLongError) {
                res.status(StatusCodes.BAD_REQUEST).send("String was too long!");
            } else if (err instanceof NotAValidNumberError) {
                res.status(StatusCodes.BAD_REQUEST).send("Number was not in a valid range!");
            }
        });
    }).catch((err: Error) => {
        res.status(StatusCodes.BAD_REQUEST).send("No tasklist found.");
    });
});

tasklistRouter.delete("/:tasklistID", isAuthenticated, async (req, res) => {
    const tasklistID = parseInt(req.params.tasklistID);
    if (tasklistID === undefined || isNaN(tasklistID) || tasklistID < 1) {
        res.status(StatusCodes.BAD_REQUEST).send("The tasklistID must be a positive number.");
        return;
    }

    await deleteTasklistByTasklistID(tasklistID).then(() => {
        res.status(StatusCodes.OK).send("Tasklist deleted.");
        return;
    }).catch((err: Error) => {
        if (err instanceof IdNotFoundError) {
            res.status(StatusCodes.BAD_REQUEST).send("No tasklist found.");
        }
    });
});
