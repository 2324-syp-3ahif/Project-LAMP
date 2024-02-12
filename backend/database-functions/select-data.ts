import {IdNotFoundError} from "../interfaces/errors/IdNotFoundError";
import sqlite3 from "sqlite3";
import {Task} from "../interfaces/model/Task";
import {ConnectionToDatabaseLostError} from "../interfaces/errors/ConnectionToDatabaseLostError";
import {Tasklist} from "../interfaces/model/Tasklist";
import {User} from "../interfaces/model/User";

export async function selectTasksByUserID(db: sqlite3.Database, userID: number): Promise<Task[]> {
    return new Promise((resolve, reject) => {
        selectUserByUserID(db, userID).then(user => {
            if (user === undefined) {
                const toGetVariableName = {userID};
                reject(new IdNotFoundError(Object.keys(toGetVariableName)[0], "No user with this userID found!"));
            }
        });
        const query = `SELECT * FROM TASKS WHERE userID = ${userID}`;
        db.all(query, (err, data) => {
            if (err) {
                reject(new ConnectionToDatabaseLostError());
            }
            resolve(data as Task[]);
        });
    });
}

export async function selectTaskByTasklistID(db: sqlite3.Database, tasklistID: number): Promise<Task[]> {
    const query = `SELECT * FROM TASKS WHERE tasklistID IS ${tasklistID}`;
    return new Promise<Task[]>((resolve, reject) => {
        selectUserByUserID(db, tasklistID).then(tasklist => {
            if (tasklist === undefined) {
                const toGetVariableName = {tasklistID};
                reject(new IdNotFoundError(Object.keys(toGetVariableName)[0], "No tasklist with this tasklistID found!"));
            }
        });
        db.all(query, (err, data) => {
            if (err) {
                reject(new ConnectionToDatabaseLostError());
            }
            resolve(data as Task[]);
        });
    });
}

export async function selectTaskByTaskID(db: sqlite3.Database, taskID: number): Promise<Task> {
    const query = `SELECT * FROM TASKS WHERE taskID IS ${taskID}`;
    return new Promise<Task>((resolve, reject) => {
        db.get(query, (err, data) => {
            if (err) {
                console.error('Error executing selectTaskByTaskID:', err.message);
                reject(err);
            }
            resolve(data as Task);
        });
    });
}

export function selectTasklistByTasklistID(db: sqlite3.Database, tasklistID: number): Promise<Tasklist> {
    const query: string = `SELECT * FROM TASKLISTS WHERE tasklistID = ${tasklistID}`;
    return new Promise<Tasklist>((resolve, reject) => {
        db.get(query, (err, data) => {
            if (err) {
                reject(new ConnectionToDatabaseLostError());
            } else if (data === undefined) {
                const forName = { tasklistID };
                reject(new IdNotFoundError(Object.keys(forName)[0], "No tasklist found for this tasklistID"));
            }
            resolve(data as Tasklist);
        })
    });
}

export async function selectUserByUserID(db: sqlite3.Database, userID: number): Promise<User> {
    const query = `SELECT * FROM USERS WHERE userID IS ${userID}`;
    return new Promise<User>((resolve, reject) => {
        db.get(query, (err, data) => {
            if (err) {
                console.error('Error executing selectUserByUserID:', err.message);
                reject(err);
            }
            resolve(data as User);
        });
    });
}