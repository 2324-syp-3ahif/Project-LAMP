import sqlite3 from "sqlite3";
import {ConnectionToDatabaseLostError} from "../interfaces/errors/ConnectionToDatabaseLostError";
import {Tasklist} from "../interfaces/model/Tasklist";
import {Task} from "../interfaces/model/Task";
import {dateFormatCheck, dateSmallerNowChecker, idNotFound, numberChecker, stringLenghtCheck} from "./insert-data";
import {checkPasswordFormat, checkStringFormat} from "../utils";
import {StringWrongFormatError} from "../interfaces/errors/StringWrongFormatError";
import {User} from "../interfaces/model/User";
import {selectUserByEmail} from "./select-data";
import {Tag} from "../interfaces/model/Tag";

export async function updateTask(db: sqlite3.Database, taskID: number, tasklistID?: number, title?: string, description?: string, dueDate?: Date, priority?: number, isComplete?: boolean): Promise<void> {
    let dd = undefined;
    if (tasklistID !== undefined) {
        await idNotFound<Tasklist>(db, tasklistID, 'TASKLISTS', 'tasklistID');
    } if (title !== undefined) {
        stringLenghtCheck(title, 50, 'title', '');
    } if (description !== undefined) {
        stringLenghtCheck(description, 255, 'description', '');
    } if (dueDate !== undefined) {
        dateFormatCheck(dueDate, 'dueDate', '');
        dateSmallerNowChecker(dueDate);
        dd = dueDate.toISOString();
    } if (priority !== undefined) {
        numberChecker(priority, 0, 10, "sortingOrder", '');
    }

    const array = [title, description, dd, priority, isComplete, tasklistID];
    const names = ["title", "description", "dueDate", "priority", "isComplete", "tasklistID"];
    await idNotFound<Task>(db, taskID, 'TASKS', 'taskID');
    for (let i = 0; i < array.length; i++) {
        if (array[i] !== undefined) {
            updateSingleColumn(db, 'TASKS', taskID, 'taskID', names[i], array[i]);
        }
    }
}

export async function updateUser(db: sqlite3.Database, email: string, username?: string, hashedPassword?: string): Promise<void> {
    await idNotFound<User>(db, email, 'USERS', 'email');
    if (username !== undefined) {
        if (!checkStringFormat(username)) {
            throw new StringWrongFormatError('username', '');
        }
        updateSingleColumn(db, 'USERS', email, 'email', 'username', username);
    } if (hashedPassword !== undefined) {
        if (!checkPasswordFormat(hashedPassword)) {
            throw new StringWrongFormatError('password', '');
        }
        updateSingleColumn(db, 'USERS', email, 'email', 'hashedPassword', hashedPassword);
    }
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

export async function updateEvent(db: sqlite3.Database, eventID: number, name?: string, description?: string, startTime?: Date, endTime?: Date, fullDay?: boolean) : Promise<void> {
    let st = undefined;
    let et = undefined;
    if (name !== undefined) {
        stringLenghtCheck(name, 50, 'name', '');
    } if (description !== undefined) {
        stringLenghtCheck(description, 255, 'description', '');
    } if (startTime !== undefined) {
        dateFormatCheck(startTime, 'startTime', '');
        dateSmallerNowChecker(startTime);
        st = startTime.toISOString();
    } if (endTime !== undefined) {
        dateFormatCheck(endTime, 'dueDate', '');
        dateSmallerNowChecker(endTime);
        et = endTime.toISOString();
    }

    const array = [name, description, st, et];
    const names = ["name", "description", "startTime", "endTime"];
    for (let i = 0; i < array.length; i++) {
        if (array[i] !== undefined) {
            updateSingleColumn(db, 'EVENTS', eventID, 'eventID', names[i], array[i]);
        }
    }
}


function updateSingleColumn(db: sqlite3.Database, tablename: string, id: number | string, idName: string, row: string, value: any): void {
    if (typeof value === 'string') {
        value = `'${value}'`;
    }
    if (typeof id === 'string') {
        id = `'${id}'`;
    }
    const query: string = `UPDATE ${tablename} SET ${row} = ${value} WHERE ${idName} IS ${id};`;
    db.run(query);
}