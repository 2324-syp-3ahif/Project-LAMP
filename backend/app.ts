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

import sqlite from "sqlite3";
import {IdNotFoundError} from "./interfaces/errors/IdNotFoundError";

import * as tasklist from './interfaces/model/Tasklist';

import { join } from "path";
import {Tag} from "./interfaces/model/Tag";

const app = express();
const port = process.env.PORT || 2000;
const db: sqlite.Database = connectToDatabase();

dotenv.config();
app.use("/api/task", taskRouter);
app.use("/api/tasklist", tasklistRouter);
app.use("/api/event", eventRouter);
app.use("/api/tag", tagRouter);
app.use("/api/user", userRouter);
app.use(express.json());
app.use(express.static('public'));

const path = join(__dirname, "../public");
const options = { extensions: ["html", "js"] }; // , "css"
app.use(express.static(path, options));

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
});
console.log('testTasklist');

app.get('/testTasklist', (_, res) => {
    const list1: tasklist.Tasklist = {
        tasklistID: 42,
        title: "HEHE",
        description: "i hope this may work",
        sortingOrder: 0,
        priority: 0,
        isLocked: false,
        ownerID: 1,
    }
    const list2: tasklist.Tasklist = {
        tasklistID: 43,
        title: "ha",
        description: "test",
        sortingOrder: 0,
        priority: 1,
        isLocked: false,
        ownerID: 1,
    }
    const list = [list1, list2];
    //send.send('http://localhost:2000/api/tasklist', 'POST', JSON.stringify(list));
    //res.send("Works");
    res.send(list);
});

app.listen(2000, () => {
    console.log(`Listening on http://localhost:2000`);
});
