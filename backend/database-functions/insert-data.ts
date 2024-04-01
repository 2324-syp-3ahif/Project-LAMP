import sqlite3 from "sqlite3";
import {checkDateFormat, checkPasswordFormat, checkStringFormat, convertTSToSQLDate} from "../utils";
import {ConnectionToDatabaseLostError} from "../interfaces/errors/ConnectionToDatabaseLostError";
import {DateExpiredError} from "../interfaces/errors/DateExpiredError";
import {IdNotFoundError} from "../interfaces/errors/IdNotFoundError";
import {DateFormatError} from "../interfaces/errors/DateFormatError";
import {StringToLongError} from "../interfaces/errors/StringToLongError";
import {NotAValidNumberError} from "../interfaces/errors/NotAValidNumberError";
import {Item} from "../interfaces/model/Item";
import {selectRowByID} from "./select-data";
import {Tasklist} from "../interfaces/model/Tasklist";
import {User} from "../interfaces/model/User";
import {Task} from "../interfaces/model/Task";
import {checkMailFormat} from '../utils';
import {StringWrongFormatError} from "../interfaces/errors/StringWrongFormatError";
import {IdAlreadyExistsError} from "../interfaces/errors/IdAlreadyExistsError";
import bcrypt from "bcrypt";

export async function insertTask(db: sqlite3.Database, title: string, dueDate: Date, description: string, priority: number, tasklistID: number, userID: number): Promise<void> {
    try {
        numberChecker(priority, 0, 10, 'priority', `Priority must be between 0 and 10`);
        dateFormatCheck(dueDate, 'dueDate', ' is not the right format!');
        dateSmallerNowChecker(dueDate);
        stringLenghtCheck(title, 50, 'title', ' cannot have more characters than ');
        stringLenghtCheck(description, 255, 'description', ' cannot have more characters than ');

        await idNotFound<Tasklist>(db, tasklistID, 'TASKLISTS', 'tasklistID');
        await idNotFound<User>(db, userID, 'USERS', 'userID');

        const query: string = `INSERT INTO TASKS (title, description, dueDate, priority, isComplete, tasklistID, userID) VALUES (?,?,?,?,?,?,?);`;
        db.run(query, [title, description, dueDate.toString(), priority, false, tasklistID, userID]);
    } catch (error) {
        return Promise.reject(error);
    }
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


async function idNotFound<T>(db: sqlite3.Database, id: number | string, tablename: string, idName: string): Promise<void> {
    const row = await selectRowByID<T>(db, id, tablename, idName);
    if (row === undefined) {
        throw new IdNotFoundError(idName);
    }
}

export async function idFound<T>(db: sqlite3.Database, id: number | string, tablename: string, idName: string): Promise<void> {
    try {
        await selectRowByID<T>(db, id, tablename, idName);
        throw new IdAlreadyExistsError(idName);
    } catch (error) {
        if (error instanceof IdAlreadyExistsError) {
            throw error;
        }
    }
}
function dateSmallerNowChecker(dueDate: Date) {
    if (new Date(dueDate).valueOf() <= new Date(Date.now()).valueOf()) {
        throw new DateExpiredError("Date already happend");
    }
}

function stringLenghtCheck(field: string, length: number, causer: string, message: string) {
    if (field.length > length) {
        throw new StringToLongError(causer, causer + message + length);
    }
}

function dateFormatCheck(dueDate: Date, causer: string, message: string) {
    if (!checkDateFormat(dueDate.toString())) {
        throw new DateFormatError(causer, causer + message);
    }
}

function numberChecker(num: number, min: number, max: number, causer: string, message: string) {
    if (num <= min || num > max) {
        throw new NotAValidNumberError(causer, message);
    }
}