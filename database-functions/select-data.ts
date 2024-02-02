import {Task} from "../model/Task";
import sqlite3 from "sqlite3";
import {connectToDatabase, disconnectFromDatabase} from "./connect";

export function selectAllTasks(): Promise<Task[]> {
    return new Promise((resolve, reject) => {
        const tasks: Task[] = [];
        const db: sqlite3.Database = connectToDatabase();
        const query = `SELECT * FROM TASKS`;

        db.all(query, (err, rows) => {
            if (err) {
                console.error('Error executing SELECT statement:', err.message);
                reject(err);
            } else {
                rows.forEach((row) => {
                    tasks.push(row as Task);
                });
                disconnectFromDatabase(db);
                console.log("Length of tasks: " + tasks.length);
                resolve(tasks);
            }
        });
    });
}

export function selectTask(id: number): Promise<Task> {
    return new Promise<Task>((resolve, reject) => {
        const db = connectToDatabase();
        const query = `SELECT * FROM TASKS WHERE id IS ${id}`;
        db.all(query, (err, rows) => {
            if (err) {
                console.error('Error executing SELECT statement:', err.message);
                reject(err);
            } else {
                disconnectFromDatabase(db);
                if (rows.length == 0) {
                    reject(err);
                } else {
                    resolve(rows.at(0) as Task);
                }
            }
        });
    });
}