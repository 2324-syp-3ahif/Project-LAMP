import sqlite3 from "sqlite3";
import { promisify } from 'util';

import {IdNotFoundError} from "../interfaces/errors/IdNotFoundError";

import {Task} from "../interfaces/model/Task";
import {Tasklist} from "../interfaces/model/Tasklist";
import {User} from "../interfaces/model/User";
import {Tag} from "../interfaces/model/Tag";

export async function selectUserByEmail(db: sqlite3.Database, email: string): Promise<User> {
    return await selectRowByID<User>(db, email, 'USERS', 'email');
}

export async function selectTagsByTasklistID(db: sqlite3.Database, tasklistID: number): Promise<Tag[]> {
    const query: string = `SELECT * FROM TAGS WHERE tagID in (SELECT tagID FROM TAGTASKLISTS WHERE tasklistID = ${tasklistID});`;
    return select<Tag>(db, query);
}

export async function selectTagsByEmail(db: sqlite3.Database, email: string): Promise<Tag[]> {
    const query: string = `SELECT * FROM TAGS WHERE email IS '${email}';`;
    return select<Tag>(db, query);
}

export async function selectTasklistsByEmail(db: sqlite3.Database, email: string): Promise<Tasklist[]> {
    const query: string = `SELECT * FROM TASKLISTS WHERE tasklistID in (SELECT tasklistID FROM USERTASKLISTS WHERE email = '${email}');`;
    console.log(query);
    return select<Tasklist>(db, query);
}

export async function selectTasksByTasklistID(db: sqlite3.Database, tasklistID: number): Promise<Task[]> {
    const query: string = `SELECT * FROM TASKS WHERE tasklistID = ${tasklistID}`;
    await selectRowByID(db, tasklistID, 'TASKLISTS', 'tasklistID');
    return await select<Task>(db, query);
}

export async function selectTaskByTaskID(db: sqlite3.Database, taskID: number): Promise<Task> {
    return await selectRowByID<Task>(db, taskID, 'TASKS', 'taskID');
}

// used to select any row from any table by id
// returns a promise with one row
// could be rejected with IdNotFoundError
export async function selectRowByID<T>(db: sqlite3.Database, tableID: number | string, tablename: string, idName: string): Promise<T> {
    const dbFunction = promisify(db.get.bind(db));
    const query = `SELECT * FROM ${tablename} WHERE ${idName} IS ${(typeof tableID === 'string' ? `'${tableID}'` : tableID)}`;
    const data = await dbFunction(query);
    if (data === undefined) {
        throw new IdNotFoundError(idName, `No id found in ${tablename}`);
    }
    return data as T;
}

export async function select<T>(db: sqlite3.Database, query: string): Promise<T[]> {
    const dbFunction = promisify(db.all.bind(db));
    const data = await dbFunction(query);
    if (data === undefined) {
        throw new IdNotFoundError("", `No id found for query: '${query}'`);
    }
    return data as T[];
}

interface Row {
    maxId: number
}

export async function getMaxId(db: sqlite3.Database, tablename: string, idname: string): Promise<number> {
    const dbFunction = promisify(db.get.bind(db));
    const data: Row = await dbFunction(`SELECT MAX(${idname}) AS maxId FROM ${tablename}`) as Row;
    return data.maxId;
}