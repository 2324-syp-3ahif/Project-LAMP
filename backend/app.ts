import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';

import {connectToDatabase} from './database-functions/connect';
import {
    createEventsTable,
    createTagsTable, createTagTasklistsTable,
    createTasklistsTable,
    createTasksTable,
    createUsersTable, createUserTasklistTable
} from './database-functions/create-tables';
import {dropTable} from './database-functions/drop-tables';
import {insertTask} from './database-functions/insert-data';
import {selectTaskByTaskID, selectTaskByTasklistID, selectTasksByUserID} from "./database-functions/select-data";
import {deleteTaskById} from './database-functions/delete-data';

import {taskRouter} from "./routers/router-task";
import {tasklistRouter} from "./routers/router-tasklist";
import {eventRouter} from "./routers/router-event";
import {tagRouter} from "./routers/router-tag";
import {userRouter} from "./routers/router-user";

import sqlite3 from "sqlite3";
import {IdNotFoundError} from "./interfaces/errors/IdNotFoundError";
import {DateExpiredError} from "./interfaces/errors/DateExpiredError";
import {checkDateFormat} from "./utils";
import {DateFormatError} from "./interfaces/errors/DateFormatError";
import {StringToLongError} from "./interfaces/errors/StringToLongError";
import {NotAValidNumberError} from "./interfaces/errors/NotAValidNumberError";

const app = express();
const port = process.env.PORT || 2000;
const db: sqlite3.Database = connectToDatabase();

dotenv.config();
app.use("/api/task", taskRouter);
app.use("/api/tasklist", tasklistRouter);
app.use("/api/event", eventRouter);
app.use("/api/tag", tagRouter);
app.use("/api/user", userRouter);
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

app.get('/test/:userID', (req, res) => {
    const taskID: number = parseInt(req.params.userID);
    selectTasksByUserID(db, taskID).then(tasks => {
        res.status(200).send(tasks);
    }).catch((err) => {
        if (err instanceof IdNotFoundError) {
            res.status(400).send("No user with this userID");
        } else {
            res.status(404).send("Unknown Error");
        }
    });
});

app.post('/hallo', (req, res) => {
    console.log(req.body);
    console.log(req.body.title);
});

app.post("/", (req, res) => {
    const title = req.body.title;
    const dueDate = req.body.dueDate;
    const description = req.body.description;
    const priority = req.body.priority;
    const tasklistID = req.body.tasklistID;
    const userID = req.body.userID;

    insertTask(db, title, dueDate, description, priority, tasklistID, userID).then(() => {
        selectTaskByTasklistID(db, tasklistID).then(tasks => {
            res.send(tasks);
        }).catch((err) => {
            if (err instanceof IdNotFoundError) {
                res.send("NO user found");
            }
        })
    }).catch((err) => {
        if (err instanceof DateExpiredError) {
            res.send("Date already was!");
        } else if (err instanceof IdNotFoundError) {
            res.send("wrongID: " + err.message);
        } else if (err instanceof DateFormatError) {
            res.send("Date is wrong format!")
        } else if (err instanceof StringToLongError) {
            res.send(err.message);
        } else if (err instanceof NotAValidNumberError) {
            res.send("Number was not in a valid range!");
        }
    });
});

app.get('/emil', (req, res) => {
    console.log("Hallo");
    res.send(checkDateFormat(req.body.dueDate));
});


app.get('/create-tables', (req, res) => {
    dropTable('TASK');
    createTasksTable();
    createTasklistsTable();
    createTagsTable();
    createUsersTable();
    createEventsTable();
    createTagTasklistsTable();
    createUserTasklistTable();
    res.send("Works");
})

app.listen(2000, () => {
    console.log(`Listening on http://localhost:2000`);
})