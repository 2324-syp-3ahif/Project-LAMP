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

const app = express();
export const port = process.env.PORT || 2000;


const limiter = RateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    limit: 100 // limit each IP to 100 requests per windowMs
});

async function startUp() {
    await createTables();
}
startUp().then(() => (console.log("Tables created.")));

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

app.listen(port, () => {
    console.log(`Listening on http://localhost:` + port);
});