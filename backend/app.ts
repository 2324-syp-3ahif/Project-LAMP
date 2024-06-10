import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';

import {taskRouter} from "./routers/router-task";
import {tasklistRouter} from "./routers/router-tasklist";
import {eventRouter} from "./routers/router-event";
import {tagRouter} from "./routers/router-tag";
import {userRouter} from "./routers/router-user";
import {mailRouter} from "./routers/router-mail";
import {loginRouter} from "./routers/router-login";

import { join } from "path";
import cookieParser from "cookie-parser";
import {createTables} from "./database-functions/create-tables";
import RateLimit from 'express-rate-limit';
import csrf from 'lusca';

import * as http from 'http';
import {Server} from 'socket.io';
import {Task} from "./interfaces/model/Task";
import {selectTasklistsByEmail} from "./database-functions/tasklist-functions";

const app = express();
const server = http.createServer(app);
const io = new Server(server);
export const port = process.env.PORT || 2000;


const limiter = RateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    limit: 300 // limit each IP to 100 requests per windowMs
});

async function startUp() {
    await createTables();
}
startUp().then(() => console.log("Tables created"));

dotenv.config();
app.use(cors());
app.use(express.json());
app.use(express.static('public'));
app.use(limiter);
app.use(csrf(), cookieParser());

app.use("/api", loginRouter);
app.use("/api/task", taskRouter);
app.use("/api/tasklist", tasklistRouter);
app.use("/api/event", eventRouter);
app.use("/api/tag", tagRouter);
app.use("/api/user", userRouter);
app.use("/api/mail", mailRouter);

const path = join(__dirname, "../public");
const options = { extensions: ["html", "js"] }; // , "css"
app.use(express.static(path, options));

io.on('connection', async (socket) => {
   socket.on('join-taskList-rooms', (taskListIDs: string[]) => {
        socket.join(taskListIDs);
   });
    socket.on('delete-taskList', (taskListID: number) => {
        socket.to(taskListID.toString()).emit('onDeletedTaskList', taskListID);
        io.socketsLeave(taskListID.toString());
        socket.rooms.delete(taskListID.toString());
    });
    socket.on('new-task', (taskListID: number, task: Task) => {
        socket.to(taskListID.toString()).emit('onNewTask', taskListID, task);
    });
    socket.on('update-task', (task: Task) => {
        socket.to(task.tasklistID.toString()).emit('onUpdateTask', task);
    })
    socket.on('disconnect', () => {
        socket.rooms.forEach(room => {
           socket.leave(room.toString())
        });
       socket.disconnect();
   });
});

server.listen(port, () => {
    console.log(`Listening on http://localhost:` + port);
});