import express from "express";

import {Task} from "../model/Task";
import {Tasklist} from "../model/Tasklist";
import {Event} from "../model/Event";
import {Tag} from "../model/Tag";

export const todoRouter = express.Router();

todoRouter.get("/", (req, res) => {
    res.status(200).send("Hello World");
});

todoRouter.get("/task", (req, res) => {
    res.status(200).send("you got the tasks from todo-router");
});

todoRouter.get("/tasklist/:id", (req, res) => {
    const id = parseInt(req.params.id);
    const test = req.query.test;

    res.status(200).send("you got th id: " + id + " from todo-router");
});