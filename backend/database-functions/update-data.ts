import sqlite3 from "sqlite3";
import {ConnectionToDatabaseLostError} from "../interfaces/errors/ConnectionToDatabaseLostError";
import {Tasklist} from "../interfaces/model/Tasklist";
import {Task} from "../interfaces/model/Task";
import {dateFormatCheck, dateSmallerNowChecker, idNotFound, numberChecker, stringLenghtCheck} from "./insert-data";

export async function updateTask(db: sqlite3.Database, taskID: number, title?: string, description?: string, dueDate?: Date, priority?: number, isComplete?: boolean, tasklistID?: number): Promise<void> {
    numberChecker((priority !== undefined ? priority : 1), 0, 10, 'priority', `Priority must be between 0 and 10`);
    dateFormatCheck((dueDate !== undefined ? dueDate : new Date(Date.now() + 1000)), 'dueDate', ' is not the right format!');
    dateSmallerNowChecker(dueDate !== undefined ? dueDate : new Date(Date.now() + 1000));
    stringLenghtCheck((title !== undefined ? title : "faksdkflsafasdf"), 50, 'title', ' cannot have more characters than ');
    stringLenghtCheck((description !== undefined ? description : "faksdkflsafasdf"), 255, 'description', ' cannot have more characters than ');

    const array = [title, description, dueDate, priority, isComplete, tasklistID];
    const names = ["title", "description", "dueDate", "priority", "isComplete", "tasklistID"];
    await idNotFound<Task>(db, taskID, 'TASKS', 'taskID');
    for (let i = 0; i < array.length; i++) {
        if (array[i] !== undefined) {
            updateSingleColumn(db, 'TASKS', taskID, 'taskID', names[i], array[i]);
        }
    }
}

export async function updateTasklist(db: sqlite3.Database, tasklistID: number, title?: string, description?: string, sortingOrder?: number, priority?: number, isLocked?: boolean) : Promise<void> {
    const array = [title, description, sortingOrder, priority, isLocked];
    const names = ["title", "description", "sortingOrder", "priority", "isLocked"];
    for (let i = 0; i < array.length; i++) {
        if (array[i] !== undefined) {
            updateSingleColumn(db, 'TASKLISTS', tasklistID, 'tasklistID', names[i], array[i]);
        }
    }
}

function updateSingleColumn(db: sqlite3.Database, tablename: string, id: number, idName: string, row: string, value: any): void {
    if (typeof value === 'string') {
        value = `'${value}'`;
    }
    const query: string = `UPDATE ${tablename} SET ${row} = ${value} WHERE ${idName} IS ${id};`;
    db.run(query);
}