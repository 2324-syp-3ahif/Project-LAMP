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
import {checkMailFormat} from "../utils";
import {selectTasksByTasklistID} from "../database-functions/select-data";
import {NotAValidNumberError} from "../interfaces/errors/NotAValidNumberError";
import {getMaxId} from "../database-functions/select-data";


export const tasklistRouter = express.Router();

tasklistRouter.get("/", (req, res) => {
    res.status(200).send("Hello World! from tasklist-router");
});
tasklistRouter.post("/:email", async (req, res) => {

    });