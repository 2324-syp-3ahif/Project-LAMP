import express from "express";

export const taskRouter = express.Router();

taskRouter.get("/", (req, res) => {
    res.status(200).send("Hello World! This is the task-router");
});
