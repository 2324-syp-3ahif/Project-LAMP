import sqlite3 from "sqlite3";
import { connectToDatabase, disconnectFromDatabase } from "./connect";

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
