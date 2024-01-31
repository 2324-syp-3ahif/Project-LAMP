import sqlite3 from 'sqlite3';
import dotenv from "dotenv";
import {Task} from "./model/Task";

dotenv.config();
export function connectToDatabase() : sqlite3.Database {
    const path = 'database/database.db';
    console.log(path);
    return new sqlite3.Database(path, (err) => {
        if (err) {
            console.error('Error connecting to SQLite database:', err.message);
        } else {
            console.log('Connected to SQLite database:', path);
        }
    });
}
export function disconnectFromDatabase(db: sqlite3.Database) : boolean {
    db.close((err) => {
        if (err) {
            console.error('Error closing SQLite database:', err.message);
            return false;
        }
        console.log('SQLite database connection closed');
    });
    return true;
}

export async function insertTask([text, priority]: [string, number]): Promise<boolean> {
    const db: sqlite3.Database = connectToDatabase();

    const query = `INSERT INTO TASKS (text, priority) VALUES (?, ?)`;

    try {
        await new Promise<void>((resolve, reject) => {
            db.run(query, [text, priority], (err) => {
                if (err) {
                    console.error("Failed insert:", err);
                    reject(err);
                } else {
                    resolve();
                }
            });
        });
    } catch (error) {
        return false;
    } finally {
        disconnectFromDatabase(db);
    }

    return true;
}


export function createTable() : boolean {
    const db : sqlite3.Database = connectToDatabase();
    const query = `
        CREATE TABLE IF NOT EXISTS TASKS (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        text TEXT NOT NULL,
        priority INTEGER);
        `;
    db.run(query, (err) => {
        if (err) {
            console.log("Failed creation!" + err.message);
            return false;
        }
        console.log("Successfully created TASKS");
    });
    disconnectFromDatabase(db);
    return true;
}

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