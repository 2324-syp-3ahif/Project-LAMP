import sqlite3 from "sqlite3";
import {
    dateFormatCheck,
    dateSmallerNowChecker,
    deleteById, idNotFound,
    numberChecker,
    select,
    selectRowByID, stringLenghtCheck, updateSingleColumn
} from "./util-functions";
import {Tasklist} from "../interfaces/model/Tasklist";
import {User} from "../interfaces/model/User";
import {Task} from "../interfaces/model/Task";

export async function selectTasksByTasklistID(db: sqlite3.Database, tasklistID: number): Promise<Task[]> {
    const query: string = `SELECT * FROM TASKS WHERE tasklistID = ${tasklistID}`;
    await selectRowByID(db, tasklistID, 'TASKLISTS', 'tasklistID');
    return await select<Task>(db, query);
}

export async function selectTaskByTaskID(db: sqlite3.Database, taskID: number): Promise<Task> {
    return await selectRowByID<Task>(db, taskID, 'TASKS', 'taskID');
}

export async function insertTask(db: sqlite3.Database, title: string, dueDate: Date, description: string, priority: number, tasklistID: number, email: string): Promise<void> {
    numberChecker(priority, 0, 10, 'priority', `Priority must be between 0 and 10`);
    dateFormatCheck(dueDate, 'dueDate', ' is not the right format!');
    dateSmallerNowChecker(dueDate);
    stringLenghtCheck(title, 50, 'title', ' cannot have more characters than ');
    stringLenghtCheck(description, 255, 'description', ' cannot have more characters than ');

    await idNotFound<Tasklist>(db, tasklistID, 'TASKLISTS', 'tasklistID');
    await idNotFound<User>(db, email, 'USERS', 'email');

    const query: string = `INSERT INTO TASKS (title, description, dueDate, priority, isComplete, tasklistID, email) VALUES (?,?,?,?,?,?,?);`;
    db.run(query, [title, description, dueDate.toString(), priority, false, tasklistID, email]);
}

export async function deleteTaskByID(db: sqlite3.Database, taskID: number) {
    await idNotFound(db, taskID, 'TASKS', 'taskID');
    await deleteById(db, taskID, 'taskID', 'TASKS');
}

export async function updateTask(db: sqlite3.Database, taskID: number, tasklistID?: number, title?: string, description?: string, dueDate?: Date, priority?: number, isComplete?: boolean): Promise<void> {
    let dd = undefined;
    if (tasklistID !== undefined) {
        await idNotFound<Tasklist>(db, tasklistID, 'TASKLISTS', 'tasklistID');
    } if (title !== undefined) {
        stringLenghtCheck(title, 50, 'title', '');
    } if (description !== undefined) {
        stringLenghtCheck(description, 255, 'description', '');
    } if (dueDate !== undefined) {
        dateFormatCheck(dueDate, 'dueDate', '');
        dateSmallerNowChecker(dueDate);
        dd = dueDate.toISOString();
    } if (priority !== undefined) {
        numberChecker(priority, 0, 10, "sortingOrder", '');
    }
    const array = [title, description, dd, priority, isComplete, tasklistID];
    const names = ["title", "description", "dueDate", "priority", "isComplete", "tasklistID"];
    await idNotFound<Task>(db, taskID, 'TASKS', 'taskID');
    for (let i = 0; i < array.length; i++) {
        if (array[i] !== undefined) {
            updateSingleColumn(db, 'TASKS', taskID, 'taskID', names[i], array[i]);
        }
    }
}