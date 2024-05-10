import {
    dateSmallerNowChecker,
    deleteFromTable,
    numberChecker,
    stringLenghtCheck,
    updateSingleColumn
} from "./util-functions";
import {Task} from "../interfaces/model/Task";
import {connectToDatabase} from "./connect";
import {selectTasklistByTasklistID} from "./tasklist-functions";
import {IdNotFoundError} from "../interfaces/errors/IdNotFoundError";
import {selectUserByUserID} from "./user-functions";
import {ConnectionToDatabaseLostError} from "../interfaces/errors/ConnectionToDatabaseLostError";

export async function selectTasksByTasklistID(tasklistID: number): Promise<Task[]> {
    await selectTasklistByTasklistID(tasklistID);
    const db = await connectToDatabase();
    const stmt = await db.prepare('SELECT * FROM TASKS WHERE tasklistID = ?');
    await stmt.bind(tasklistID);
    const result = await stmt.all<Task[]>();
    await stmt.finalize();
    await db.close();
    return result;
}

export async function selectTaskByTaskID(taskID: number): Promise<Task> {
    const db = await connectToDatabase();
    const stmt = await db.prepare('SELECT * FROM TASKS WHERE taskID = ?');
    await stmt.bind(taskID);
    const result = await stmt.get<Task>();
    if (result === undefined) {
        throw new IdNotFoundError('taskID');
    }
    await stmt.finalize();
    await db.close();
    return result;
}

export async function insertTask(title: string, description: string, dueDate: number, priority: number, tasklistID: number, userID: number): Promise<number> {
    numberChecker(priority, 0, 10, 'priority', `Priority must be between 0 and 10`);
    dateSmallerNowChecker(dueDate);
    stringLenghtCheck(title, 50, 'title');
    stringLenghtCheck(description, 255, 'description');

    await selectTasklistByTasklistID(tasklistID);
    await selectUserByUserID(userID);

    const db = await connectToDatabase();
    const stmt = await db.prepare('INSERT INTO TASKS (title, description, dueDate, priority, isComplete, tasklistID, userID) VALUES (?,?,?,?,?,?,?);');
    await stmt.bind(title, description, dueDate, priority, false, tasklistID, userID);
    try {
        const operationResult = await stmt.run();
        await stmt.finalize();
        return operationResult.lastID!;
    } catch (error: any) {
        throw new ConnectionToDatabaseLostError();
    } finally {
        await db.close();
    }
}

export async function deleteTaskByTaskID(taskID: number) {
    await selectTaskByTaskID(taskID);
    await deleteFromTable('DELETE FROM TASKS WHERE taskID = ?;', taskID);
}

export async function updateTask(taskID: number, tasklistID?: number, title?: string, description?: string, dueDate?: number, priority?: number, isComplete?: boolean): Promise<void> {
    if (tasklistID !== undefined) {
        await selectTasklistByTasklistID(tasklistID);
    } if (title !== undefined) {
        stringLenghtCheck(title, 50, 'title');
    } if (description !== undefined) {
        stringLenghtCheck(description, 255, 'description');
    } if (dueDate !== undefined) {
        dateSmallerNowChecker(dueDate);
    } if (priority !== undefined) {
        numberChecker(priority, 0, 10, "sortingOrder", '');
    }
    const array = [title, description, dueDate, priority, isComplete ? 1 : 0, tasklistID];
    const names = ["title", "description", "dueDate", "priority", "isComplete", "tasklistID"];
    await selectTaskByTaskID(taskID);
    for (let i = 0; i < array.length; i++) {
        if (array[i] !== undefined) {
            await updateSingleColumn('TASKS', taskID, 'taskID', names[i], array[i]);
        }
    }
}