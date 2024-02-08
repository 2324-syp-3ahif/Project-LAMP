import {Task} from "../model/Task";
import sqlite3 from "sqlite3";
import {connectToDatabase, disconnectFromDatabase} from "./connect";

export function selectTasksByUserID(db: sqlite3.Database, userID: number): Promise<Task[]> {
    const query = `SELECT * FROM TASKS WHERE userID = ${userID}`;
    return new Promise((resolve, reject) => {
        db.all(query, (err, data) => {
            if (err) {
                console.error('Error executing selectTasksByUserID:', err.message);
                reject(err);
            } else {
                resolve(data as Task[]);
            }
        });
    });
}

export function selectTaskByTasklistID(db: sqlite3.Database, tasklistID: number): Promise<Task[]> {
    const query = `SELECT * FROM TASKS WHERE tasklistID IS ${tasklistID}`;
    return new Promise<Task[]>((resolve, reject) => {
        db.all(query, (err, data) => {
            if (err) {
                console.error('Error executing selectTaskByTasklistID:', err.message);
                reject(err);
            }
            resolve(data as Task[]);
        });
    });
}

export function selectTaskByTaskID(db: sqlite3.Database, taskID: number): Promise<Task> {
    const query = `SELECT * FROM TASKS WHERE taskID IS ${taskID}`;
    return new Promise<Task>((resolve, reject) => {
        db.all(query, (err, data) => {
            if (err) {
                console.error('Error executing selectTaskByTaskID:', err.message);
                reject(err);
            }
            resolve(data.at(0) as Task);
        });
    });
}