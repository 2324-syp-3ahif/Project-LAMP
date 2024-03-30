import express from "express";

export const eventRouter = express.Router();

eventRouter.get("/", (req, res) => {
    res.status(200).send("Hello World!, from Event Router");
});


