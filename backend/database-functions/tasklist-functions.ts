import {deleteFromTable, numberChecker, stringLengthCheck, updateSingleColumn} from "./util-functions";
import {Tasklist} from "../interfaces/model/Tasklist";
import {addCollaboratorToTasklist} from "./usertaklist-functions";
import {connectToDatabase} from "./connect";
import {IdNotFoundError} from "../interfaces/errors/IdNotFoundError";
import {getUserID, selectUserByEmail} from "./user-functions";

export async function selectTasklistByTasklistID(tasklistID: number): Promise<Tasklist> {
    const db = await connectToDatabase();
    const stmt = await db.prepare('SELECT * FROM TASKLISTS WHERE tasklistID = ?');
    await stmt.bind(tasklistID);
    const result = await stmt.get<Tasklist>();
    if (result === undefined) {
        throw new IdNotFoundError('TASKLISTS', 'tasklistID');
    }
    await stmt.finalize();
    await db.close();
    return result;
}

export async function selectTasklistsByEmail(email: string): Promise<Tasklist[]> {
    const db = await connectToDatabase();
    console.log(email);
    const stmt = await db.prepare("SELECT * FROM TASKLISTS WHERE tasklistID in (SELECT tasklistID FROM USERTASKLISTS WHERE userID = ?);");
    await stmt.bind(await getUserID(email));
    console.log(await getUserID(email));
    const result = await stmt.all<Tasklist[]>();
    await stmt.finalize();
    await db.close();
    return result;
}

export async function insertTasklist(title: string, description: string, priority: number, sortingOrder: number, email: string): Promise<number> {
    numberChecker(priority, 0, 10, 'priority', `Priority must be between 0 and 10`);
    numberChecker(sortingOrder, 0, 8, 'priority', `Priority must be between 0 and 8`);
    stringLengthCheck(title, 50, 'title');
    stringLengthCheck(description, 255, 'description');
    await selectUserByEmail(email);
    const date: number = Date.now();
    const db = await connectToDatabase();
    const stmt = await db.prepare('INSERT INTO TASKLISTS (title, description, sortingOrder, priority, isLocked, userID, lastViewed, creationDate) VALUES (?,?,?,?,?,?,?,?);');
    await stmt.bind(title, description, sortingOrder, priority, 0, await getUserID(email), date, date);
    try {
        const operationResult = await stmt.run();
        await stmt.finalize();
        if (operationResult === undefined || operationResult.lastID === undefined) {
            throw new Error('No lastID found');
        }
        await addCollaboratorToTasklist(operationResult.lastID , email);
        return operationResult.lastID!;
    } finally {
        await db.close();
    }
}

export async function updateTasklist(tasklistID: number, title?: string, description?: string, sortingOrder?: number, priority?: number, isLocked?: number) : Promise<void> {
    if (title !== undefined) {
        stringLengthCheck(title, 50, 'title');
    } if (description !== undefined) {
        stringLengthCheck(description, 255, 'description');
    } if (sortingOrder !== undefined) {
        numberChecker(sortingOrder, 0, 8, 'sortingOrder', '');
    } if (priority !== undefined) {
        numberChecker(priority, 0, 10, "sortingOrder", '');
    }
    const array = [title, description, sortingOrder, priority, isLocked];
    const names = ["title", "description", "sortingOrder", "priority", "isLocked"];
    for (let i = 0; i < array.length; i++) {
        if (array[i] !== undefined) {
            await updateSingleColumn('TASKLISTS', tasklistID, 'tasklistID', names[i], array[i]);
        }
    }
}
export async function deleteTasklistByTasklistID(tasklistID: number) {
    await selectTasklistByTasklistID(tasklistID);
    await deleteFromTable(`DELETE FROM TASKS WHERE tasklistID = ?;`, tasklistID);
    await deleteFromTable(`DELETE FROM TAGTASKLISTS WHERE tasklistID = ?;`, tasklistID);
    await deleteFromTable(`DELETE FROM USERTASKLISTS WHERE tasklistID = ?;`, tasklistID);
    await deleteFromTable('DELETE FROM TASKLISTS WHERE tasklistID = ?', tasklistID);
}