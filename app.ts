import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';

import {connectToDatabase} from './database-functions/connect';
import {createTasklistTable, createTasksTable} from './database-functions/create-tables';
import {dropTable} from './database-functions/drop-tables';
import {insertTask} from './database-functions/insert-data';
import {deleteTaskById} from './database-functions/delete-data';
import {selectAllTasks} from "./database-functions/select-data";

import {Task} from "./model/Task";
import {todoRouter} from "./routers/router-todo";

const app = express();
const port = process.env.PORT || 2000;

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
    selectAllTasks().then(tasks => {
        if (tasks === undefined) {
            res.status(400);
        } else {
            res.send({
                "tasks": tasks
            });
        }
    });

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

app.get('/emil', (req, res) => {
    createTasklistTable();
    res.send("Hallo");
})

app.listen(2000, () => {
    console.log(`Listening on http://localhost:2000`);
})