import express from "express";
import {isAuthenticated} from "../middleware/auth-handlers";

export const eventRouter = express.Router();

eventRouter.get("/", isAuthenticated, (_, res) => {
    res.status(200).send("Hello World!, from Event Router");
});


