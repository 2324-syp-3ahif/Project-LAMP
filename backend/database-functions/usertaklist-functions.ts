import {connectToDatabase} from "./connect";
import {selectTasklistByTasklistID} from "./tasklist-functions";
import {getUserID, selectUserByEmail} from "./user-functions";
import {IdAlreadyExistsError} from "../interfaces/errors/IdAlreadyExistsError";

export async function addCollaboratorToTasklist(tasklistID: number, email: string): Promise<void> {
    const db = await connectToDatabase();
    try {
        await selectTasklistByTasklistID(tasklistID);
        await selectUserByEmail(email);
        await alreadyAdded(tasklistID, email);
        const stmt = await db.prepare('INSERT INTO USERTASKLISTS (tasklistID, userID) VALUES (?, ?);');
        await stmt.bind(tasklistID, await getUserID(email));
        await stmt.run();
        await stmt.finalize();
    } finally {
        await db.close();
    }
}

async function alreadyAdded(tasklistID: number, email: string): Promise<boolean> {
    const db = await connectToDatabase();
    try {
        const stmt = await db.prepare("SELECT * FROM USERTASKLISTS WHERE tasklistID = ?1 and userID = ?2;");
        await stmt.bind({ 1: tasklistID, 2: await getUserID(email) });
        const data = await stmt.all<any[]>();
        await stmt.finalize();
        if (data.length !== 0) {
            throw new IdAlreadyExistsError("tagID email");
        }
        return data.length !== 0;
    } finally {
        await db.close();
    }
}