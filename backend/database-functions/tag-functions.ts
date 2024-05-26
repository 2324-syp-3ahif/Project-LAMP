import {deleteFromTable, stringLengthCheck, updateSingleColumn} from "./util-functions";
import {Tag} from "../interfaces/model/Tag";
import {checkStringFormat} from "../utils";
import {StringWrongFormatError} from "../interfaces/errors/StringWrongFormatError";
import {connectToDatabase} from "./connect";
import {selectTasklistByTasklistID} from "./tasklist-functions";
import {getUserID, selectUserByEmail} from "./user-functions";
import {ConnectionToDatabaseLostError} from "../interfaces/errors/ConnectionToDatabaseLostError";
import {IdNotFoundError} from "../interfaces/errors/IdNotFoundError";

export async function selectTagsByTasklistID(tasklistID: number): Promise<Tag[]> {
    await selectTasklistByTasklistID(tasklistID);
    const db = await connectToDatabase();
    const stmt = await db.prepare('SELECT * FROM TAGS WHERE tagID IN (SELECT tagID FROM TAGTASKLISTS WHERE tasklistID = ?);');
    await stmt.bind(tasklistID);
    const result = await stmt.all<Tag[]>();
    await stmt.finalize();
    await db.close();
    return result;
}

export async function selectTagByTagID(tagID: number): Promise<Tag> {
    const db = await connectToDatabase();
    const stmt = await db.prepare('SELECT * FROM TAGS WHERE tagID = ?;');
    await stmt.bind(tagID);
    const result = await stmt.get<Tag>();
    await stmt.finalize();
    await db.close();
    if (result === undefined) {
        throw new IdNotFoundError('tagID');
    }
    return result;
}

export async function selectTagsByEmail(email: string): Promise<Tag[]> {
    await selectUserByEmail(email);
    const db = await connectToDatabase();
    const stmt = await db.prepare('SELECT * FROM TAGS WHERE userID = ?;');
    await stmt.bind(await getUserID(email));
    const result = await stmt.all<Tag[]>();
    await stmt.finalize();
    await db.close();
    return result;
}

export async function insertTag(name: string, email: string): Promise<number> {
    stringLengthCheck(name, 50, 'tagname');
    await selectUserByEmail(email);
    const db = await connectToDatabase();
    const stmt = await db.prepare('INSERT INTO TAGS (name, userID) VALUES (?,?);');
    await stmt.bind(name, await getUserID(email));
    try {
        const operationResult = await stmt.run();
        await stmt.finalize();
        return operationResult.lastID!;
    } catch(error: any) {
        if (error.code === 'SQLITE_CONSTRAINT') {
            throw new Error('tagname already exists');
        } else {
            throw new ConnectionToDatabaseLostError();
        }
    } finally {
        await db.close();
    }
}

export async function updateTag(tagID: number, name: string) {
    await selectTagByTagID(tagID);

    if (name !== undefined) {
        if (!checkStringFormat(name)) {
            throw new StringWrongFormatError('name');
        }
        await updateSingleColumn('TAGS', tagID, 'tagID', 'name', name);
    }
}


export async function deleteTag(tagID: number) {
    await selectTagByTagID(tagID);
    await deleteFromTable(`DELETE FROM TAGTASKLISTS WHERE tagID = ${tagID};`);
    await deleteFromTable('DELETE FROM TAGS WHERE tagID = ?', tagID);
}