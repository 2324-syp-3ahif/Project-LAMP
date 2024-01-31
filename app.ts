import express from 'express';
import dotenv from 'dotenv';
import {connectToDatabase, createTable, insertTask, selectAllTasks} from "./database-functions";
import {Task} from "./model/Task";

dotenv.config();

const app = express();
const port = process.env.PORT || 2000;

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
            res.send(tasks);
        }
    });

});

app.get('/', (req, res) => {
    res.sendFile(__dirname + '\\public\\index.html');
});

app.listen(2000, () => {
    console.log(`Listening on http://localhost:2000`);
})