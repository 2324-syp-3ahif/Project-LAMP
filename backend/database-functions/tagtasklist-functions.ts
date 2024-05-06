import sqlite3 from "sqlite3";
import {Tasklist} from "../interfaces/model/Tasklist";
import {Tag} from "../interfaces/model/Tag";
import {IdAlreadyExistsError} from "../interfaces/errors/IdAlreadyExistsError";
import {idNotFound, select} from "./util-functions";

export async function addTagToTasklist(db: sqlite3.Database, tasklistID: number, tagID: number): Promise<void> {
    await idNotFound<Tasklist>(db, tasklistID, 'TASKLISTS', 'tasklistID');
    await idNotFound<Tag>(db, tagID, 'TAGS', 'tagID');

    const data = await select<string>(db, `SELECT * FROM TAGTASKLISTS WHERE tasklistID = ${tasklistID} and tagID = ${tagID};`);
    if (data.length !== 0) {
        throw new IdAlreadyExistsError('tagID', 'idAlreadyAdded');
    }

    const query: string = `INSERT INTO TAGTASKLISTS (tasklistID, tagID) VALUES (?,?);`;
    db.run(query, [tasklistID, tagID]);
}
