import {IdAlreadyExistsError} from "../interfaces/errors/IdAlreadyExistsError";
import {selectTasklistByTasklistID} from "./tasklist-functions";
import {selectTagByTagID} from "./tag-functions";
import {connectToDatabase} from "./connect";

export async function addTagToTasklist(tasklistID: number, tagID: number): Promise<void> {
    await selectTasklistByTasklistID(tasklistID);
    await selectTagByTagID(tagID);

    await alreadyAdded(tasklistID, tagID);
    const db = await connectToDatabase();
    const insertStmt = await db.prepare("INSERT INTO TAGTASKLISTS (tasklistID, tagID) VALUES (?, ?);");
    await insertStmt.bind(tasklistID, tagID);
    await insertStmt.run();
    await insertStmt.finalize();
    await db.close();
}

async function alreadyAdded(tasklistID: number, tagID: number): Promise<boolean> {
    const db = await connectToDatabase();
    const stmt = await db.prepare("SELECT * FROM TAGTASKLISTS WHERE tasklistID = ?1 and tagID = ?2;");
    await stmt.bind({ 1: tasklistID, 2: tagID});
    const data = await stmt.all<any[]>();
    await stmt.finalize();
    await db.close();
    if (data.length !== 0) {
        throw new IdAlreadyExistsError("tagID tasklistID");
    }
    return data.length !== 0;
}

export async function removeTagFromTasklist(tasklistID: number, tagID: number): Promise<void> {
    await selectTasklistByTasklistID(tasklistID);
    await selectTagByTagID(tagID);

    await notAdded(tasklistID, tagID);
    const db = await connectToDatabase();
    const stmt = await db.prepare("DELETE FROM TAGTASKLISTS WHERE tasklistID = ?1 and tagID = ?2;");
    await stmt.bind({ 1: tasklistID, 2: tagID});
    await stmt.run();
    await stmt.finalize();
    await db.close();
}

async function notAdded(tasklistID: number, tagID: number): Promise<boolean> {
    const db = await connectToDatabase();
    const stmt = await db.prepare("SELECT * FROM TAGTASKLISTS WHERE tasklistID = ?1 and tagID = ?2;");
    await stmt.bind({ 1: tasklistID, 2: tagID});
    const data = await stmt.all<any[]>();
    await stmt.finalize();
    await db.close();
    if (data.length === 0) {
        throw new IdAlreadyExistsError("tagID tasklistID");
    }
    return data.length === 0;
}