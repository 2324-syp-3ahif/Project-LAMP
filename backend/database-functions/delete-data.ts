import sqlite3 from "sqlite3";
import { connectToDatabase, disconnectFromDatabase } from "./connect";
import {promisify} from "util";
import {idNotFound, stringLenghtCheck} from "./insert-data";
import {select} from "./select-data";
import {Tasklist} from "../interfaces/model/Tasklist";
export async function deleteTaskByID(db: sqlite3.Database, taskID: number) {
    await idNotFound(db, taskID, 'TASKS', 'taskID');
    await deleteById(db, taskID, 'taskID', 'TASKS');
}

export async function deleteTasklistByID(db: sqlite3.Database, tasklistID: number) {
    await idNotFound(db, tasklistID, 'TASKLISTS', 'tasklistID');
    await deleteFromTable(db, `DELETE FROM TASKS WHERE tasklistID = ${tasklistID};`);
    await deleteById(db, tasklistID, 'tasklistID', 'TASKLISTS');
    await deleteFromTable(db, `DELETE FROM TAGTASKLISTS WHERE tasklistID = ${tasklistID};`);
    await deleteFromTable(db, `DELETE FROM USERASKLISTS WHERE tasklistID = ${tasklistID};`);
}

export async function delteUserByEmail(db: sqlite3.Database, email: string) {
    await idNotFound(db, email, 'USERS', 'email');
    const tasklists = await select<Tasklist>(db, `SELECT * FROM TASKLISTS WHERE email = '${email}';`)
    tasklists.forEach((tasklist: Tasklist) => {
        deleteTasklistByID(db, tasklist.tasklistID);
    });
    await deleteById(db, email, 'email', 'USERS');
    await deleteFromTable(db, `DELETE FROM USERTASKLISTS WHERE email = '${email}';`);
}

export async function deleteEventByID(db: sqlite3.Database, eventID: number) {
    await idNotFound(db, eventID, 'EVENTS', 'eventID');
    await deleteById(db, eventID, 'eventID', 'EVENTS');
}

export async function deleteTagByID(db: sqlite3.Database, tagID: number) {
    await idNotFound(db, tagID, 'TAGS', 'tagID');
    await deleteById(db, tagID, 'tagID', 'TAGS');
    await deleteFromTable(db, `DELETE FROM TAGTASKLISTS WHERE tagID = ${tagID};`);
}

async function deleteById(db: sqlite3.Database, id: number | string, idname: string, tablename: string): Promise<void> {
    const dbFunction = promisify(db.run.bind(db));
    const query= `DELETE FROM ${tablename} WHERE ${idname} = ${(typeof id === "string" ? "'" + id + "'" : id)}`;
    await dbFunction(query);
}

async function deleteFromTable(db: sqlite3.Database, query: string): Promise<void> {
    const dbFunction = promisify(db.run.bind(db));
    await dbFunction(query);
}

