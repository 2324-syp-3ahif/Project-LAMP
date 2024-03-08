import express from "express";

export const tagRouter = express.Router();

tagRouter.get("/", (req, res) => {
    res.status(200).send("Hello World! from tag-router");
});