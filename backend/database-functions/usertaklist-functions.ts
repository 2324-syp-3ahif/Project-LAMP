import sqlite3 from "sqlite3";
import {User} from "../interfaces/model/User";
import {Tasklist} from "../interfaces/model/Tasklist";
import {idNotFound} from "./util-functions";

export async function addColaboratorToTasklist(db: sqlite3.Database, tasklistID: number, email: string): Promise<void> {
    await idNotFound<User>(db, email, 'USERS', 'email');
    await idNotFound<Tasklist>(db, tasklistID, 'TASKLISTS', 'tasklistID');

    const query: string = `INSERT INTO USERTASKLISTS (tasklistID, email) VALUES (?,?);`;
    db.run(query, [tasklistID, email]);
}