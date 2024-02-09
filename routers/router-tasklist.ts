import express from "express";

import {Task} from "../model/Task";
import {Tasklist} from "../model/Tasklist";
import {Event} from "../model/Event";
import {Tag} from "../model/Tag";

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
    if (checkIfFalseTitle(req.body.title)){
        res.status(400).send("title must be at least 1 character long");
        return;
    }
    const title = req.body.title;
    const description = req.body.description ?? "";
    const sortingOrder = req.body.sortingOrder ?? 1;
    const priority = req.body.priority ?? 1;
    if (checkIfFalseSortingOrder(sortingOrder)){
        res.status(400).send("sortingOrder must be a positive number");
        return;
    }
    if (checkIfFalsePriority(priority)){
        res.status(400).send("priority must be a positive number");
        return;
    }

});
function checkIfFalseTitle(title: string): boolean {
    if (title === undefined || title.length < 1){
        return true;
    }
    return false;
}
function checkIfFalseSortingOrder(sortingOrder: number): boolean {
    if (sortingOrder === undefined || isNaN(sortingOrder) || sortingOrder < 1){
        return true;
    }
    return false;
}
function checkIfFalsePriority(priority: number): boolean {
    if (priority === undefined || isNaN(priority) || priority < 1){
        return true;
    }
    return false;
}