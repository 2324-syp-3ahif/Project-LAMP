import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import {connectToDatabase} from './database-functions/connect';

import {taskRouter} from "./routers/router-task";
import {tasklistRouter} from "./routers/router-tasklist";
import {eventRouter} from "./routers/router-event";
import {tagRouter} from "./routers/router-tag";
import {userRouter} from "./routers/router-user";
import {mailRouter} from "./routers/router-mail";
import {loginRouter} from "./routers/router-login";

import sqlite from "sqlite3";
import { join } from "path";
import {test} from "./database-functions/select-data";

const app = express();
const port = process.env.PORT || 2000;
export const db: sqlite.Database = connectToDatabase();

dotenv.config();
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

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


app.get("/", (req, res) => {
    test(db);
});


app.listen(2000, () => {
    console.log(`Listening on http://localhost:` + port);
});