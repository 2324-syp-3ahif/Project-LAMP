import sqlite3 from "sqlite3";
import { connectToDatabase, disconnectFromDatabase } from "./connect";

export function deleteTaskById(id: number): boolean {
    const db: sqlite3.Database = connectToDatabase();
    const sql = `DELETE FROM TASKS WHERE id = ?`;

    db.run(sql, [id], function(err) {
        if (err) {
            console.error(err.message);
            return false;
        }
        console.log(`Row(s) deleted: ${this.changes}`);
    });
    return true;
}