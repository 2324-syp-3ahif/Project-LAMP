import {IdNotFoundError} from "../interfaces/errors/IdNotFoundError";
import sqlite3 from "sqlite3";
import {Task} from "../interfaces/model/Task";
import {ConnectionToDatabaseLostError} from "../interfaces/errors/ConnectionToDatabaseLostError";
import {Tasklist} from "../interfaces/model/Tasklist";
import {User} from "../interfaces/model/User";

export async function selectTasksByTasklistID(db: sqlite3.Database, tasklistID: number): Promise<Task[]> {
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

// TASKS
export async function selectTaskByTaskID(db: sqlite3.Database, taskID: number): Promise<Task> {
    return selectByID<Task>(db, taskID, 'TASKS', Object.keys({taskID})[0]);

}

// TASKLISTS
export function selectTasklistByTasklistID(db: sqlite3.Database, tasklistID: number): Promise<Tasklist> {
    return selectByID<Tasklist>(db, tasklistID, 'TASKLISTS', Object.keys({tasklistID})[0]);
}

export function selectTasklistsByUserID(db: sqlite3.Database, userID: number): Promise<Tasklist[]> {
    const idName: string = Object.keys({userID})[0];
    return new Promise<Tasklist[]>((resolve, reject) => {
        selectByID<User[]>(db, userID, 'USERS', Object.keys({userID})[0]).then(users => {
            if (users === undefined || (users as []).length === 0) {
                reject(new IdNotFoundError(idName, 'No item with id, ' + idName));
            }
        }).catch((err) => {
            reject(err);
        });
        selectByID<string>(db, userID, 'USERTASKLISTS', Object.keys({userID})[0]).then(usertasklists => {
            const tasklists = JSON.parse(usertasklists);
            console.log(typeof tasklists);
            resolve(tasklists);
        }).catch(err => {
            reject(err);
        });
    });
}

export async function selectByID<T>(db: sqlite3.Database, tableID: number, tablename: string, idName: string): Promise<T> {
    const query = `SELECT * FROM ${tablename} WHERE ${idName} IS ${tableID}`;
    const data = await db.all(query);
    return new Promise<T>((resolve, reject) => {
        db.all(query, (err, data) => {
            if (err) {
                console.error(`Error executing selectByID on table ${tablename}:`, err.message);
                reject(err);
            } else if (data === undefined) {
                const forName = { tableID };
                reject(new IdNotFoundError(Object.keys(forName)[0], `No id found in ${tablename}`));
            }
            resolve(data as T);
        });
    });
}