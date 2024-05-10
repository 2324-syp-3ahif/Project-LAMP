import {deleteFromTable, numberChecker, stringLenghtCheck, updateSingleColumn} from "./util-functions";
import {Tasklist} from "../interfaces/model/Tasklist";
import {addColaboratorToTasklist} from "./usertaklist-functions";
import {connectToDatabase} from "./connect";
import {IdNotFoundError} from "../interfaces/errors/IdNotFoundError";
import {ConnectionToDatabaseLostError} from "../interfaces/errors/ConnectionToDatabaseLostError";

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

export async function selectTasklistsByUserID(userID: number): Promise<Tasklist[]> {
    const db = await connectToDatabase();
    const stmt = await db.prepare("SELECT * FROM TASKLISTS WHERE tasklistID in (SELECT tasklistID FROM USERTASKLISTS WHERE userID = ?);");
    await stmt.bind(userID);
    const result = await stmt.all<Tasklist[]>();
    if (result.length === 0) {
        throw new IdNotFoundError('USERS', 'userID');
    }
    await stmt.finalize();
    await db.close();
    return result;
}

export async function insertTasklist(title: string, description: string, priority: number, isLocked: boolean, sortingOrder: number, userID: number, lastViewed: number, creationDate: number): Promise<number> {
    numberChecker(priority, 0, 10, 'priority', `Priority must be between 0 and 10`);
    numberChecker(sortingOrder, 0, 8, 'priority', `Priority must be between 0 and 8`);
    stringLenghtCheck(title, 50, 'title');
    stringLenghtCheck(description, 255, 'description');
    const db = await connectToDatabase();
    const stmt = await db.prepare('INSERT INTO TASKLISTS (title, description, sortingOrder, priority, isLocked, userID, lastViewed, creationDate) VALUES (?,?,?,?,?,?,?,?);');
    await stmt.bind(title, description, sortingOrder, priority, isLocked ? 1 : 0, userID, lastViewed, creationDate);
    try {
        const operationResult = await stmt.run();
        await stmt.finalize();
        if (operationResult === undefined || operationResult.lastID === undefined) {
            throw new Error('No lastID found');
        }
        await addColaboratorToTasklist(operationResult.lastID ,userID);
        return operationResult.lastID!;
    } catch (error: any) {
        throw new ConnectionToDatabaseLostError();
    } finally {
        await db.close();
    }
}

export async function updateTasklist(tasklistID: number, title?: string, description?: string, sortingOrder?: number, priority?: number, isLocked?: boolean) : Promise<void> {
    if (title !== undefined) {
        stringLenghtCheck(title, 50, 'title');
    } if (description !== undefined) {
        stringLenghtCheck(description, 255, 'description');
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