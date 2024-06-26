import express from "express";
import {Event} from "../interfaces/model/Event";
import {isAuthenticated} from "../middleware/auth-handlers";
import {
    deleteEventByID,
    insertEvent,
    selectEventByEventID,
    selectEventsByEmail, updateEvent
} from "../database-functions/event-functions";

export const eventRouter = express.Router();

eventRouter.get("/", isAuthenticated, (_, res) => {
    res.status(200).send("Hello world! (from Event Router)");
});

eventRouter.get("/:email", isAuthenticated, async (_, res) => {
    try {
        const events: Event[] = await selectEventsByEmail(_.params.email);
        res.send(events);
    } catch(e: any) {
        res.status(400).send("Error while selecting events.");
    }
});

eventRouter.delete("/:eventID", isAuthenticated, async (req, res) => {
   try {
       await deleteEventByID(Number.parseInt(req.params.eventID));
       res.send(200);
   } catch (e) {
         res.status(400).send("Error while deleting event.");
   }
});

eventRouter.put("/:email", isAuthenticated, async (req, res) => {
    try {
        await updateEvent(req.body);
        res.send(await selectEventByEventID(req.body.eventID));
    } catch (e) {
        res.status(400).send("ID not found while updating event.");
    }
});

eventRouter.post("/:email", isAuthenticated, async (req, res) => {

    for (const key in req.body) {
        if (!req.body.hasOwnProperty(key) || req.body[key] === undefined) {
            res.status(400).send("Wrong input format.");
        } else {
            console.log(`${key}: ${req.body[key]}`);
        }
    }
    try {
        const eventID = await insertEvent(req.body.name, req.body.description, req.body.startTime, req.body.endTime, req.body.fullDay, req.params.email);
        res.send(await selectEventByEventID(eventID));
    } catch (e) {
        res.status(400).send("Could not insert event.");
    }
});
