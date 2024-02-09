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
import {Task} from "./ts-interfaces/model/Task";
import {IdNotFoundError} from "./ts-interfaces/errors/IdNotFoundError";

import sqlite3 from "sqlite3";

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

app.post('/task', async (req, res) => {
    const result: boolean = await insertTask([req.body.text, req.body.priority]);
    if (result) {
        res.send("Successfully inserted row to TASKS");
    } else {
        res.status(404);
    }
});

app.get('/task', (req, res) => {

});

app.delete('/task', (req, res) => {
    const worked : boolean = deleteTaskById(req.body.id);
    if (worked) {
        res.send("That worked out!");
    } else {
        res.status(400).send("That did not work out!");
    }
});

app.get('/', (req, res) => {
    //dropTable('temp');
    console.log("Hallo");
    res.sendFile(__dirname + '\\public\\index.html');
});

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
    res.send();
})

app.listen(2000, () => {
    console.log(`Listening on http://localhost:2000`);
})