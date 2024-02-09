import express from "express";

import {Task} from "../model/Task";
import {Tasklist} from "../model/Tasklist";
import {Event} from "../model/Event";
import {Tag} from "../model/Tag";

export const tagRouter = express.Router();

tagRouter.get("/", (req, res) => {
    res.status(200).send("Hello World! from tag-router");
});