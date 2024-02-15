import sqlite3 from "sqlite3";
import {checkDateFormat, convertTSToSQLDate} from "../utils";
import {ConnectionToDatabaseLostError} from "../interfaces/errors/ConnectionToDatabaseLostError";
import {DateExpiredError} from "../interfaces/errors/DateExpiredError";
import {selectTasklistByTasklistID, selectUserByUserID} from "./select-data";
import {IdNotFoundError} from "../interfaces/errors/IdNotFoundError";
import {DateFormatError} from "../interfaces/errors/DateFormatError";
import {StringToLongError} from "../interfaces/errors/StringToLongError";
import {NotAValidNumberError} from "../interfaces/errors/NotAValidNumberError";
import {Item} from "../interfaces/model/Item";
/*
export async function inserTask(db: sqlite3.Database, title: string, dueDate: Date, description: string, priority: number, tasklistID: number, userID: number): Promise<void> {
     return new Promise<void>((resolve, reject) => {
         if (checkDateFormat(dueDate.toString())) {
             if (priority > 0 && priority <= 10) {
                 if (title.length <= 50) {
                     if (description.length <= 255) {
                         if (new Date(dueDate).valueOf() > new Date(Date.now()).valueOf()) {
                             selectUserByUserID(db, userID).catch((err) => {
                                 if (err instanceof IdNotFoundError) {
                                     reject(err);
                                 }
                             }).then(v => {
                                 selectTasklistByTasklistID(db, tasklistID).catch((err) => {
                                     if (err instanceof IdNotFoundError) {
                                         reject(err);
                                     }
                                 }).then(v => {
                                     const query: string = `INSERT INTO TASKS (title, description, dueDate, priority, isComplete, tasklistID, userID) VALUES (?,?,?,?,?,?,?);`;
                                     db.run(query, [title, description, dueDate.toString(), priority, false, tasklistID, userID], (err) => {
                                         if (err) {
                                             console.log(err.message);
                                             reject(new ConnectionToDatabaseLostError());
                                         }
                                         resolve();
                                     });
                                 })
                             });
                         } else {
                             reject(new DateExpiredError());
                         }
                     } else {
                         const d = {description};
                         reject(new StringToLongError(Object.keys(d)[0], "Description to long!"));
                     }
                 } else {
                     const d = {title};
                     reject(new StringToLongError(Object.keys(d)[0], "Title to long!"));
                 }
             } else {
                 const d = {priority};
                reject(new NotAValidNumberError(Object.keys(d)[0], "Priority wrong format!"));
             }
         } else {
             const d = {dueDate};
             reject(new DateFormatError(Object.keys(d)[0], "Date wrong format"));
         }
     });
}*/

export async function insertTask(db: sqlite3.Database, title: string, dueDate: Date, description: string, priority: number, tasklistID: number, userID: number): Promise<void> {
    try {
        numberChecker(priority, 0, 10, 'priority', `Priority must be between 0 and 10`);
        dateFormatCheck(dueDate, Object.keys({dueDate})[0], ' is not the right format!');
        dateSmallerNowChecker(dueDate);
        stringLenghtCheck(title, 50, 'title', ' cannot have more characters than ');
        stringLenghtCheck(description, 255, 'description', ' cannot have more characters than ');

        await idNotFound(db, tasklistID, (db, tasklistID) => {return selectTasklistByTasklistID(db, tasklistID)}, " not found!", "tasklistID")
        await idNotFound(db, userID, (db, userID) => {return selectUserByUserID(db, userID)}, " not found!", "userID")

        const query: string = `INSERT INTO TASKS (title, description, dueDate, priority, isComplete, tasklistID, userID) VALUES (?,?,?,?,?,?,?);`;
        db.run(query, [title, description, dueDate.toString(), priority, false, tasklistID, userID]);

        return Promise.resolve();
    } catch (error) {
        return Promise.reject(error);
    }
}

async function idNotFound(db: sqlite3.Database, id: number, func: (db: sqlite3.Database, id: number) => Promise<Item>, message: string, name: string) {
    const item = await func(db, id);
    if (item === undefined) {
        throw new IdNotFoundError(name, name + message);
    }
}
function dateSmallerNowChecker(dueDate: Date) {
    if (new Date(dueDate).valueOf() <= new Date(Date.now()).valueOf()) {
        throw new DateExpiredError("Date already happend");
    }
}

function stringLenghtCheck(field: string, length: number, causer: string, message: string) {
    if (field.length > length) {
        throw new StringToLongError(causer, causer + message + length);
    }
}

function dateFormatCheck(dueDate: Date, causer: string, message: string) {
    if (!checkDateFormat(dueDate.toString())) {
        throw new DateFormatError(causer, causer + message);
    }
}

function numberChecker(num: number, min: number, max: number, causer: string, message: string) {
    if (num <= min || num > max) {
        throw new NotAValidNumberError(causer, message);
    }
}