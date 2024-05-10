import sqlite3 from "sqlite3";
import {open, Database} from "sqlite";

const config = {
    filename: `./backend/database/database.db`,
    driver: sqlite3.Database
};

export async function connectToDatabase() : Promise<Database> {
    return await open(config);
}