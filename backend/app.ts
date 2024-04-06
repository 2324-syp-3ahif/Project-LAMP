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
import {

    selectEventByEventID,
    selectEventsByEmail,
    selectTaskByTaskID,
    selectTasksByTasklistID
} from "./database-functions/select-data";
import {
    deleteEventByID,
    deleteTagByID,
    deleteTaskByID,
    deleteTasklistByID,
    delteUserByEmail
} from './database-functions/delete-data';

import {taskRouter} from "./routers/router-task";
import {tasklistRouter} from "./routers/router-tasklist";
import {eventRouter} from "./routers/router-event";
import {tagRouter} from "./routers/router-tag";
import {userRouter} from "./routers/router-user";
import {mailRouter} from "./routers/router-mail";

import sqlite from "sqlite3";
import {IdNotFoundError} from "./interfaces/errors/IdNotFoundError";
import {DateExpiredError} from "./interfaces/errors/DateExpiredError";
import {checkDateFormat} from "./utils";
import {DateFormatError} from "./interfaces/errors/DateFormatError";
import {StringToLongError} from "./interfaces/errors/StringToLongError";
import {NotAValidNumberError} from "./interfaces/errors/NotAValidNumberError";
import {updateEvent, updateTask} from "./database-functions/update-data";
import {Task} from "./interfaces/model/Task";
import * as tasklist from './interfaces/model/Tasklist';

import { join } from "path";

const app = express();
const port = process.env.PORT || 2000;
const db: sqlite.Database = connectToDatabase();

dotenv.config();
app.use(express.json());
app.use(express.static('public'));
app.use("/api/task", taskRouter);
app.use("/api/tasklist", tasklistRouter);
app.use("/api/event", eventRouter);
app.use("/api/tag", tagRouter);
app.use("/api/user", userRouter);
app.use("/api/mail", mailRouter);


const path = join(__dirname, "../public");
const options = { extensions: ["html", "js"] }; // , "css"
app.use(express.static(path, options));

app.get('/test/:userID', (req, res) => {
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
        selectTasksByTasklistID(db, tasklistID).then(tasks => {
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

app.put("/", (req, res) => {
    const taskID = req.body.taskID;
    const title = req.body.title;
    const dueDate = req.body.dueDate;
    const description = req.body.description;
    const priority = req.body.priority;
    const tasklistID = req.body.tasklistID;

    updateTask(db, taskID, tasklistID, title, description, dueDate, priority, false).then(() => {
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
    selectTaskByTaskID(db, taskID).then((task: Task) => {
        console.log(typeof task.isComplete);
        res.send(task);

    }).catch((err) => {
        if (err instanceof IdNotFoundError) {
            res.send("NO user found");
        }
    })
});


app.get('/emil', async (req, res) => {
    try {
        await delteUserByEmail(db, 'test24@gmx.at');
        const data = await selectEventByEventID(db, 1);
        res.send(data);
    } catch (err) {
        res.send((err as Error).message);
    }
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

app.get('/testTasklist', (req, res) => {
    const list: tasklist.Tasklist = {
        tasklistID: 42,
        title: "HEHE",
        description: "i hope this may work",
        sortingOrder: 0,
        priority: 0,
        isLocked: false,
        ownerID: 1,
    }
    //send.send('http://localhost:2000/api/tasklist', 'POST', JSON.stringify(list));
    //res.send("Works");
    res.send(list);
});

app.listen(2000, () => {
    console.log(`Listening on http://localhost:2000`);
});
