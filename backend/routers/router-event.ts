import express from "express";
import {Event} from "../interfaces/model/Event";
import {isAuthenticated} from "../middleware/auth-handlers";
import {insertEvent, selectEventByEventID} from "../database-functions/event-functions";

export const eventRouter = express.Router();

eventRouter.get("/", isAuthenticated, (_, res) => {
    res.status(200).send("Hello World!, from Event Router");
});

eventRouter.post("/:email", isAuthenticated, async (req, res) => {
    for (const key in req.body) {
        if (!req.body.hasOwnProperty(key) || req.body[key] === undefined) {
            console.log(`${key}: ${req.body[key]}`);
            res.status(400).send("Wrong input format");
        } else {
            console.log(`${key}: ${req.body[key]}`);
        }
    }
    try {
        const eventID = await insertEvent(req.body.name, req.body.description, req.body.startTime, req.body.endTime, req.body.fullDay, req.params.email);
        res.send(await selectEventByEventID(eventID));
    } catch (e) {
        res.status(400).send((e as Error).message);
    }
});
