import sqlite3 from "sqlite3";
import {ConnectionToDatabaseLostError} from "../interfaces/errors/ConnectionToDatabaseLostError";

export function updateTask(db: sqlite3.Database, taskID: number, title?: string, description?: string, dueDate?: Date, priority?: number, isComplete?: boolean, tasklistID?: number): Promise<void> {
    return new Promise<void>((resolve, reject) => {
        try {
            const tablename: string = 'TASKS';
            (title) ? updateSingleColumn(db, tablename, taskID, Object.keys({taskID})[0], Object.keys({title})[0], title) : title;
            (description) ? updateSingleColumn(db, tablename, taskID, Object.keys({taskID})[0], Object.keys({description})[0], description) : description;
            (dueDate) ? updateSingleColumn(db, tablename, taskID, Object.keys({taskID})[0], Object.keys({dueDate})[0], dueDate) : dueDate;
            (priority) ? updateSingleColumn(db, tablename, taskID, Object.keys({taskID})[0], Object.keys({priority})[0], priority) : priority;
            (isComplete !== undefined) ? updateSingleColumn(db, tablename, taskID, Object.keys({taskID})[0], Object.keys({isComplete})[0], isComplete) : isComplete;
            (tasklistID) ? updateSingleColumn(db, tablename, taskID, Object.keys({taskID})[0], Object.keys({tasklistID})[0], tasklistID) : tasklistID;
            resolve();
        } catch(err) {
            reject(err)
        }
    });
}

function updateSingleColumn(db: sqlite3.Database, tablename: string, id: number, idName: string, row: string, value: any): void {
    if (typeof value === 'string' || value instanceof String) {
        value = `"${value}"`;
    }
    const query: string = `UPDATE ${tablename} SET ${row} = ${value} WHERE ${idName} = ${id};`;
    // TODO Remove console output
    console.log(query);
    db.run(query, (err) => {
        if (err) {
            console.log(err.message)
             throw new ConnectionToDatabaseLostError();
        }
    });
}