import sqlite3 from "sqlite3";
import {
    deleteById,
    deleteFromTable, getMaxId,
    idNotFound,
    numberChecker, select,
    stringLenghtCheck,
    updateSingleColumn
} from "./util-functions";
import {User} from "../interfaces/model/User";
import {Tasklist} from "../interfaces/model/Tasklist";
import {addColaboratorToTasklist} from "./usertaklist-functions";


export async function selectTasklistsByEmail(db: sqlite3.Database, email: string): Promise<Tasklist[]> {
    const query: string = `SELECT * FROM TASKLISTS WHERE tasklistID in (SELECT tasklistID FROM USERTASKLISTS WHERE email = '${email}');`;
    console.log(query);
    return select<Tasklist>(db, query);
}

export async function insertTasklist(db: sqlite3.Database, title: string, description: string, priority: number, isLocked: boolean, sortingOrder: number, ownerEmail: string): Promise<void> {
    numberChecker(priority, 0, 10, 'priority', `Priority must be between 0 and 10`);
    numberChecker(sortingOrder, 0, 8, 'priority', `Priority must be between 0 and 8`);
    stringLenghtCheck(title, 50, 'title', ' cannot have more characters than ');
    stringLenghtCheck(description, 255, 'description', ' cannot have more characters than ');

    await idNotFound<User>(db, ownerEmail, 'USERS', 'email');

    const id = (await getMaxId(db,'TASKLISTS', 'tasklistID')) + 1;
    const query: string = `INSERT INTO TASKLISTS (tasklistID, title, description, sortingOrder, priority, isLocked, email) VALUES (?, ?,?,?,?,?,?);`;

    db.run(query, [id, title, description, sortingOrder, priority, isLocked, ownerEmail]);
    await addColaboratorToTasklist(db, id, ownerEmail);
}

export async function updateTasklist(db: sqlite3.Database, tasklistID: number, title?: string, description?: string, sortingOrder?: number, priority?: number, isLocked?: boolean) : Promise<void> {
    if (title !== undefined) {
        stringLenghtCheck(title, 50, 'title', '');
    } if (description !== undefined) {
        stringLenghtCheck(description, 255, 'description', '');
    } if (sortingOrder !== undefined) {
        numberChecker(sortingOrder, 0, 8, 'sortingOrder', '');
    } if (priority !== undefined) {
        numberChecker(priority, 0, 10, "sortingOrder", '');
    }
    const array = [title, description, sortingOrder, priority, isLocked];
    const names = ["title", "description", "sortingOrder", "priority", "isLocked"];
    for (let i = 0; i < array.length; i++) {
        if (array[i] !== undefined) {
            updateSingleColumn(db, 'TASKLISTS', tasklistID, 'tasklistID', names[i], array[i]);
        }
    }
}

export async function deleteTasklistByID(db: sqlite3.Database, tasklistID: number) {
    await idNotFound(db, tasklistID, 'TASKLISTS', 'tasklistID');
    await deleteFromTable(db, `DELETE FROM TASKS WHERE tasklistID = ${tasklistID};`);
    await deleteById(db, tasklistID, 'tasklistID', 'TASKLISTS');
    await deleteFromTable(db, `DELETE FROM TAGTASKLISTS WHERE tasklistID = ${tasklistID};`);
    await deleteFromTable(db, `DELETE FROM USERASKLISTS WHERE tasklistID = ${tasklistID};`);
}
