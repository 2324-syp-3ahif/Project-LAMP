import {IdNotFoundError} from "../interfaces/errors/IdNotFoundError";
import sqlite3 from "sqlite3";
import {Task} from "../interfaces/model/Task";
import {ConnectionToDatabaseLostError} from "../interfaces/errors/ConnectionToDatabaseLostError";
import {Tasklist} from "../interfaces/model/Tasklist";
import {User} from "../interfaces/model/User";
import {Tag} from "../interfaces/model/Tag";

/*export async function selectTasksByTasklistID(db: sqlite3.Database, tasklistID: number): Promise<Task[]> {
    const idName: string = Object.keys({tasklistID})[0];
    return new Promise<Task[]>(async (resolve, reject) => {
        selectByID<Tasklist[]>(db, tasklistID, 'TASKLISTS', idName).then(tasklists => {
            if (tasklists === undefined || (tasklists as []).length === 0) {
                reject(new IdNotFoundError(idName, 'No item with id, ' + idName));
            }
        }).catch((err) => {
            reject(err);
        });
        selectByID<Task[]>(db, tasklistID, 'TASKS', idName).then(tasks => {
            resolve(tasks as Task[]);
        }).catch(err => {
            reject(err);
        });
    });
}
*/

export async function selectUserByEmail(db: sqlite3.Database, email: string): Promise<User> {
    return await selectRowByID<User>(db, email, 'USERS', 'email');
}

export async function selectTagsByTasklistID(db: sqlite3.Database, tasklistID: number): Promise<Tag[]> {
    try {
        const query: string = `SELECT * FROM TAGS WHERE tagID in (SELECT tagID FROM TAGTASKLISTS WHERE tasklistID = ${tasklistID});`;
        return select<Tag>(db, query);
    } catch (error) {
        console.log((error as Error).message);
        throw error;
    }
}

export async function selectTasklistsByEmail(db: sqlite3.Database, email: string): Promise<Tasklist[]> {
    try {
        const query: string = `SELECT * FROM TASKLISTS WHERE tasklistID in (SELECT tasklistID FROM USERTASKLISTS WHERE email = ${email});`;
        return select<Tasklist>(db, query);
    } catch (error) {
        throw error;
    }
}

export async function selectTasksByTasklistID(db: sqlite3.Database, tasklistID: number): Promise<Task[]> {
    try {
        const query: string = `SELECT * FROM TASKS WHERE tasklistID = ${tasklistID}`;
        await selectRowByID(db, tasklistID, 'TASKLISTS', 'tasklistID');
        return await select<Task>(db, query);
    } catch (error) {
        throw error;
    }
}

// TASKS
export async function selectTaskByTaskID(db: sqlite3.Database, taskID: number): Promise<Task> {
    try {
        return await selectRowByID<Task>(db, taskID, 'TASKS', 'taskID');
    } catch (error) {
        if (error instanceof IdNotFoundError) {
            console.log("IdNotFoundError");
            throw new IdNotFoundError(error.causer, error.message);
        }
        throw error;
    }
}

/*
// TASKLISTS
export function selectTasklistByTasklistID(db: sqlite3.Database, tasklistID: number): Promise<Tasklist> {
    return selectByID<Tasklist>(db, tasklistID, 'TASKLISTS', Object.keys({tasklistID})[0]);
}

export async function selectTasklistsByUserID(db: sqlite3.Database, userID: number): Tasklist[] {
    const idName: string = Object.keys({userID})[0];

    selectByID<User[]>(db, userID, 'USERS', Object.keys({userID})[0], (err: Error | null, data?: User[]) => {
        if (err !== undefined && data !== undefined && data.length !== 0) {
            selectByID<string>(db, userID, 'USERTASKLISTS', Object.keys({userID})[0], (err: Error | null, data: string) => {
                const tasklists = JSON.parse(data);
                console.log(typeof tasklists);
            });
        }
    });
}*/

// used to select any row from any table by id
// returns a promise with one row
// could be rejected with IdNotFoundError
export async function selectRowByID<T>(db: sqlite3.Database, tableID: number | string, tablename: string, idName: string): Promise<T> {
    if (typeof tableID === 'string') {
        tableID = `'${tableID}'`;
    }
    const query = `SELECT * FROM ${tablename} WHERE ${idName} IS ${tableID}`;
    return new Promise<T>((resolve, reject) => {
        db.get(query,(err, data) => {
            if (err) {
                reject(err);
            } else if (data === undefined) {
                reject(new IdNotFoundError(idName, `No id found in ${tablename}`));
            } else {
                resolve(data as T);
            }
        });
    });
}

export async function select<T>(db: sqlite3.Database, query: string): Promise<T[]> {
    return new Promise<T[]>((resolve, reject) => {
        db.all(query,(err, data) => {
            if (err) {
                reject(err);
            } else if (data === undefined) {
                reject(new IdNotFoundError("", `No id found for query: '${query}'`));
            } else {
                resolve(data as T[]);
            }
        });
    });
}

export async function selectAll<T>(db: sqlite3.Database, tablename: string): Promise<T[]> {
    const query = `SELECT * FROM ${tablename}`;
    return new Promise<T[]>((resolve, reject) => {
        db.all(query,(err, data) => {
            if (err) {
                reject(err);
            } else {
                resolve(data as T[]);
            }
        });
    });
}
