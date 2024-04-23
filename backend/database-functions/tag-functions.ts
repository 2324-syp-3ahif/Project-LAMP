import sqlite3 from "sqlite3";
import {
    deleteById,
    deleteFromTable,
    getMaxId,
    idNotFound,
    select,
    stringLenghtCheck,
    updateSingleColumn
} from "./util-functions";
import {User} from "../interfaces/model/User";
import {Tag} from "../interfaces/model/Tag";
import {checkStringFormat} from "../utils";
import {StringWrongFormatError} from "../interfaces/errors/StringWrongFormatError";

export async function selectTagsByTasklistID(db: sqlite3.Database, tasklistID: number): Promise<Tag[]> {
    const query: string = `SELECT * FROM TAGS WHERE tagID in (SELECT tagID FROM TAGTASKLISTS WHERE tasklistID = ${tasklistID});`;
    return select<Tag>(db, query);
}

export async function selectTagsByEmail(db: sqlite3.Database, email: string): Promise<Tag[]> {
    const query: string = `SELECT * FROM TAGS WHERE email IS '${email}';`;
    return select<Tag>(db, query);
}

export async function insertTag(db: sqlite3.Database, name: string, email: string): Promise<void> {
    stringLenghtCheck(name, 50, 'tagname', ' cannot have more characters than ');
    await idNotFound<User>(db, email, 'USERS', 'email');

    const query: string = `INSERT INTO TAGS (tagID, name, email) VALUES (?,?,?);`;
    const id: number = (await getMaxId(db,'TAGS', 'tagID',)) + 1;
    db.run(query, [id, name, email]);
}

export async function updateTag(db: sqlite3.Database, tagID: number, name: string) {
    await idNotFound<Tag>(db, tagID, 'TAGS', 'tagID');

    if (name !== undefined) {
        if (!checkStringFormat(name)) {
            throw new StringWrongFormatError('name', '');
        }
        updateSingleColumn(db, 'TAGS', tagID, 'tagID', 'name', name);
    }
}


export async function deleteTagByID(db: sqlite3.Database, tagID: number) {
    await idNotFound(db, tagID, 'TAGS', 'tagID');
    await deleteById(db, tagID, 'tagID', 'TAGS');
    await deleteFromTable(db, `DELETE FROM TAGTASKLISTS WHERE tagID = ${tagID};`);
}