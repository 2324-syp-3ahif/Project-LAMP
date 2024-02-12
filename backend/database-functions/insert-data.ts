import sqlite3 from "sqlite3";
import { connectToDatabase, disconnectFromDatabase } from "./connect";
import {convertTSToSQLDate} from "../utils";
import {ConnectionToDatabaseLostError} from "../interfaces/errors/ConnectionToDatabaseLostError";
export async function insertTask(db: sqlite3.Database, title: string, dueDate: Date, description: string, priority: number, tasklistID: number, userID: number): Promise<void> {
     return new Promise<void>((resolve, reject) => {
         const date = convertTSToSQLDate(dueDate);
         const query: string = `INSERT INTO TASKS (title, description, dueDate, priority, isComplete, tasklistID, userID) VALUES (${title}, ${description},, ${date}, ${priority}, false, ${tasklistID}, $);`;
         db.run(query, [title, description, date, priority, false, tasklistID, userID], (err) => {
            if (err) {
                reject(new ConnectionToDatabaseLostError());
            }
            resolve();
         });
     });
}
