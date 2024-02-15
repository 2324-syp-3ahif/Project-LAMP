import sqlite3 from "sqlite3";
import {ConnectionToDatabaseLostError} from "../interfaces/errors/ConnectionToDatabaseLostError";

export function updateTask(db: sqlite3.Database, taskID: number, title?: string, description?: string, dueDate?: Date, priority?: number, isComplete?: boolean, tasklistID?: number): Promise<void> {
    return new Promise<void>((resolve, reject) => {
        try {
            const tablename: string = 'TASKS';
            (title) ? updateSingleColumn(db, tablename, taskID, Object.keys({taskID})[0], Object.keys({title})[0], title) : title;
            (description) ? updateSingleColumn(db, tablename, taskID, Object.keys({taskID})[0], Object.keys({title: description})[0], description) : description;
            (dueDate) ? updateSingleColumn(db, tablename, taskID, Object.keys({taskID})[0], Object.keys({title: dueDate})[0], dueDate) : dueDate;
            (priority) ? updateSingleColumn(db, tablename, taskID, Object.keys({taskID})[0], Object.keys({title: priority})[0], priority) : priority;
            (isComplete) ? updateSingleColumn(db, tablename, taskID, Object.keys({taskID})[0], Object.keys({title: isComplete})[0], isComplete) : isComplete;
            (tasklistID) ? updateSingleColumn(db, tablename, taskID, Object.keys({taskID})[0], Object.keys({title: tasklistID})[0], tasklistID) : tasklistID;
        } catch(err) {
            reject(err)
        }

    });
}

function updateSingleColumn(db: sqlite3.Database, tablename: string, id: number, idName: string, row: string, value: any): void {
    const query: string = `UPDATE ${tablename} SET ${row} = ${value} WHERE ${idName} = ${id};`;
    db.run(query, (err) => {
        if (err) {
             throw new ConnectionToDatabaseLostError();
        }
    });
}