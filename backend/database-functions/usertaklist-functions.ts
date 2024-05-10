import {connectToDatabase} from "./connect";
import {selectTasklistByTasklistID} from "./tasklist-functions";
import {selectUserByUserID} from "./user-functions";
import {IdAlreadyExistsError} from "../interfaces/errors/IdAlreadyExistsError";

export async function addColaboratorToTasklist(tasklistID: number, userID: number): Promise<void> {
    const db = await connectToDatabase();
    try {
        await selectTasklistByTasklistID(tasklistID);
        await selectUserByUserID(userID);
        await alreadyAdded(tasklistID, userID);
        const stmt = await db.prepare('INSERT INTO USERTASKLISTS (tasklistID, userID) VALUES (?, ?);');
        await stmt.bind(tasklistID, userID);
        await stmt.run();
        await stmt.finalize();
    } finally {
        await db.close();
    }
}

async function alreadyAdded(tasklistID: number, userID: number): Promise<boolean> {
    const db = await connectToDatabase();
    try {
        const stmt = await db.prepare("SELECT * FROM USERTASKLISTS WHERE tasklistID = ?1 and userID = ?2;");
        await stmt.bind({ 1: tasklistID, 2: userID});
        const data = await stmt.all<any[]>();
        await stmt.finalize();
        if (data.length !== 0) {
            throw new IdAlreadyExistsError("tagID userID");
        }
        return data.length !== 0;
    } finally {
        await db.close();
    }
}