import express from "express";
import * as utils from "./routerUtils";
import {Tasklist} from "../ts-interfaces/model/Tasklist";

export const tasklistRouter = express.Router();

tasklistRouter.get("/", (req, res) => {
    res.status(200).send("Hello World! from tasklist-router");
});
tasklistRouter.post("/:userID", (req, res) => {
    const userID = parseInt(req.params.userID);
    if (userID === undefined || isNaN(userID) || userID <= 0){
        res.status(400).send("userID must be a positive number");
        return;
    }
    if (utils.checkIfFalseTitle(req.body.title)){
        res.status(400).send("title must be at least 1 character long");
        return;
    }
    const title = req.body.title;
    const description = req.body.description ?? "";
    const sortingOrder = req.body.sortingOrder ?? 1;
    const priority = req.body.priority ?? 1;
    if (utils.checkIfFalseSortingOrder(sortingOrder)){
        res.status(400).send("sortingOrder must be a positive number");
        return;
    }
    if (utils.checkIfFalsePriority(priority)){
        res.status(400).send("priority must be a positive number");
        return;
    }
    const result : Tasklist = {
        tasklistID: 1,
        title: title,
        description: description,
        sortingOrder: sortingOrder,
        priority: priority,
        isLocked: false,
        ownerID: userID
    };
    res.status(201).json(result);
});