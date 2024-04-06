import sqlite3 from "sqlite3";
import {checkDateFormat, checkPasswordFormat, checkStringFormat} from "../utils";
import {DateExpiredError} from "../interfaces/errors/DateExpiredError";
import {IdNotFoundError} from "../interfaces/errors/IdNotFoundError";
import {DateFormatError} from "../interfaces/errors/DateFormatError";
import {StringToLongError} from "../interfaces/errors/StringToLongError";
import {NotAValidNumberError} from "../interfaces/errors/NotAValidNumberError";
import {getMaxId, select, selectRowByID} from "./select-data";
import {Tasklist} from "../interfaces/model/Tasklist";
import {User} from "../interfaces/model/User";
import {Task} from "../interfaces/model/Task";
import {checkMailFormat} from '../utils';
import {StringWrongFormatError} from "../interfaces/errors/StringWrongFormatError";
import {IdAlreadyExistsError} from "../interfaces/errors/IdAlreadyExistsError";
import bcrypt from "bcrypt";
import {Tag} from "../interfaces/model/Tag";

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

export async function addColaboratorToTasklist(db: sqlite3.Database, tasklistID: number, email: string): Promise<void> {
    await idNotFound<User>(db, email, 'USERS', 'email');
    await idNotFound<Tasklist>(db, tasklistID, 'TASKLISTS', 'tasklistID');

    const query: string = `INSERT INTO USERTASKLISTS (tasklistID, email) VALUES (?,?);`;
    db.run(query, [tasklistID, email]);
}

export async function addTagToTasklist(db: sqlite3.Database, tasklistID: number, tagID: number): Promise<void> {
    await idNotFound<Tasklist>(db, tasklistID, 'TASKLISTS', 'tasklistID');
    await idNotFound<Tag>(db, tagID, 'TAGS', 'tagID');

    const data = await select<string>(db, `SELECT * FROM TAGTASKLISTS WHERE tasklistID = ${tasklistID} and tagID = ${tagID};`);
    if (data.length !== 0) {
        throw new IdAlreadyExistsError('tagID', 'idAlreadyAdded');
    }

    const query: string = `INSERT INTO TAGTASKLISTS (tasklistID, tagID) VALUES (?,?);`;
    db.run(query, [tasklistID, tagID]);
}

export async function insertTask(db: sqlite3.Database, title: string, dueDate: Date, description: string, priority: number, tasklistID: number, email: string): Promise<void> {
    numberChecker(priority, 0, 10, 'priority', `Priority must be between 0 and 10`);
    dateFormatCheck(dueDate, 'dueDate', ' is not the right format!');
    dateSmallerNowChecker(dueDate);
    stringLenghtCheck(title, 50, 'title', ' cannot have more characters than ');
    stringLenghtCheck(description, 255, 'description', ' cannot have more characters than ');

    await idNotFound<Tasklist>(db, tasklistID, 'TASKLISTS', 'tasklistID');
    await idNotFound<User>(db, email, 'USERS', 'email');

    const query: string = `INSERT INTO TASKS (title, description, dueDate, priority, isComplete, tasklistID, email) VALUES (?,?,?,?,?,?,?);`;
    db.run(query, [title, description, dueDate.toString(), priority, false, tasklistID, email]);
}

export async function insertEvent(db: sqlite3.Database, name: string, description: string, startTime: Date, endTime: Date, fullDay: boolean, email: string): Promise<void> {
    dateFormatCheck(startTime, 'startTime', ' is not the right format!');
    dateSmallerNowChecker(startTime);
    dateFormatCheck(endTime, 'endTime', ' is not the right format!');
    dateSmallerNowChecker(endTime);
    stringLenghtCheck(name, 50, 'name', ' cannot have more characters than ');
    stringLenghtCheck(description, 255, 'description', ' cannot have more characters than ');

    await idNotFound<User>(db, email, 'USERS', 'email');

    const id: number = (await getMaxId(db, 'EVENTS', 'eventID')) + 1;
    const query: string = `INSERT INTO EVENTS (eventID, name, startTime, endTime, fullDay, description, email) VALUES (?, ?,?,?,?,?,?);`;
    db.run(query, [id, name, startTime, endTime, fullDay, description, email]);
}

export async function insertTag(db: sqlite3.Database, name: string, email: string): Promise<void> {
    stringLenghtCheck(name, 50, 'tagname', ' cannot have more characters than ');
    await idNotFound<User>(db, email, 'USERS', 'email');

    const query: string = `INSERT INTO TAGS (tagID, name, email) VALUES (?,?,?);`;
    const id: number = (await getMaxId(db,'TAGS', 'tagID',)) + 1;
    db.run(query, [id, name, email]);
}

export async function insertUser(db: sqlite3.Database, email: string, username: string, password: string): Promise<void> {
    stringLenghtCheck(email, 50, 'email', ' cannot have more characters than ');
    stringLenghtCheck(username, 50, 'username', ' cannot have more characters than ');
    if (!checkMailFormat(email)) {
        throw new StringWrongFormatError('email');
    } if (!checkPasswordFormat(password)) {
        throw new StringWrongFormatError('password');
    } if (!checkStringFormat(username)) {
        throw new StringWrongFormatError('username');
    }
    await idFound<User>(db, email, 'USERS', 'email');

    const query: string = `INSERT INTO USERS (email, username, hashedPassword) VALUES (?,?,?);`;
    db.run(query, [email, username, await bcrypt.hash(password, 10)]);
}


export async function idNotFound<T>(db: sqlite3.Database, id: number | string, tablename: string, idName: string): Promise<void> {
    const row = await selectRowByID<T>(db, id, tablename, idName);
    if (row === undefined) {
        throw new IdNotFoundError(idName);
    }
}

export async function idFound<T>(db: sqlite3.Database, id: number | string, tablename: string, idName: string): Promise<void> {
    try {
        const a = await selectRowByID<T>(db, id, tablename, idName);
        throw new IdAlreadyExistsError(idName);
    } catch (error) {
        if (error instanceof IdAlreadyExistsError) {
            throw error;
        }
    }
}
export function dateSmallerNowChecker(dueDate: Date) {
    if (new Date(dueDate).valueOf() <= new Date(Date.now()).valueOf()) {
        throw new DateExpiredError("Date already happend");
    }
}

export function stringLenghtCheck(field: string, length: number, causer: string, message: string) {
    if (field.length > length) {
        throw new StringToLongError(causer, causer + message + length);
    }
}

export function dateFormatCheck(dueDate: Date, causer: string, message: string) {
    if (!checkDateFormat(dueDate.toString())) {
        throw new DateFormatError(causer, causer + message);
    }
}

export function numberChecker(num: number, min: number, max: number, causer: string, message: string) {
    if (num <= min || num > max) {
        throw new NotAValidNumberError(causer, message);
    }
}