import sqlite3 from "sqlite3";
import {checkDateFormat, convertTSToSQLDate} from "../utils";
import {ConnectionToDatabaseLostError} from "../interfaces/errors/ConnectionToDatabaseLostError";
import {DateExpiredError} from "../interfaces/errors/DateExpiredError";
import {selectTasklistByTasklistID, selectUserByUserID} from "./select-data";
import {IdNotFoundError} from "../interfaces/errors/IdNotFoundError";
import {DateFormatError} from "../interfaces/errors/DateFormatError";
import {StringToLongError} from "../interfaces/errors/StringToLongError";
export async function insertTask(db: sqlite3.Database, title: string, dueDate: Date, description: string, priority: number, tasklistID: number, userID: number): Promise<void> {
     return new Promise<void>((resolve, reject) => {
         if (new Date(dueDate).valueOf() <= new Date(Date.now()).valueOf()) {
             reject(new DateExpiredError());
         }
         if (title.length > 50) {
             const d = {title};
             reject(new StringToLongError(Object.keys(d)[0], "Title to long!"))
         }
         if (description.length > 255) {
             const d = {title};
             reject(new StringToLongError(Object.keys(d)[0], "Description to long!"))
         }
         if (!checkDateFormat(dueDate.toString())) {
             const d = {dueDate};
             reject(new DateFormatError(Object.keys(d)[0], "Date wrong format"));
         }
         selectUserByUserID(db, userID).catch((err) => {
             if (err instanceof IdNotFoundError) {
                 reject(err);
             }
         });
         selectTasklistByTasklistID(db, tasklistID).catch((err) => {
             if (err instanceof IdNotFoundError) {
                 reject(err);
             }
         })
         const query: string = `INSERT INTO TASKS (title, description, dueDate, priority, isComplete, tasklistID, userID) VALUES (?,?,?,?,?,?,?);`;
         db.run(query, [title, description, dueDate.toString(), priority, false, tasklistID, userID], (err) => {
            if (err) {
                console.log(err.message);
                reject(new ConnectionToDatabaseLostError());
            }
            resolve();
         });
     });
}
