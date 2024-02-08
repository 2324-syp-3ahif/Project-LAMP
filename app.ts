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
import {deleteTaskById} from './database-functions/delete-data';

import {Task} from "./model/Task";
import {todoRouter} from "./routers/router-todo";
import {selectTaskByTaskID, selectTaskByTasklistID, selectTasksByUserID} from "./database-functions/select-data";
import sqlite3 from "sqlite3";

const app = express();
const port = process.env.PORT || 2000;
const db: sqlite3.Database = connectToDatabase();

dotenv.config();
app.use("/api/todo", todoRouter);
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
    selectTaskByTaskID(db, taskID).then(task => {
        res.status(200).send(task);
    });
    res.status(404);
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