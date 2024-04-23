import {connectToDatabase} from "./connect";
import {promisify} from "util";
import sqlite3 from "sqlite3";

export async function dropTable(db: sqlite3.Database, tableName: string) {
    const dropFunctions = promisify(db.run.bind(db));
    const query: string = `DROP TABLE ${tableName};`;
    await dropFunctions(query);
    console.log("Table dropped!");
}