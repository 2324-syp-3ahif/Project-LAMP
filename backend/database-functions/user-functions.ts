import {Tasklist} from "../interfaces/model/Tasklist";
import {deleteTasklistByTasklistID} from "./tasklist-functions";
import {deleteFromTable, stringLengthCheck, updateSingleColumn} from "./util-functions";
import {checkMailFormat, checkPasswordFormat, checkStringFormat} from "../utils";
import {StringWrongFormatError} from "../interfaces/errors/StringWrongFormatError";
import {User} from "../interfaces/model/User";
import * as bcrypt from "bcrypt";
import {connectToDatabase} from "./connect";
import {IdNotFoundError} from "../interfaces/errors/IdNotFoundError";
import {IdAlreadyExistsError} from "../interfaces/errors/IdAlreadyExistsError";
import {ConnectionToDatabaseLostError} from "../interfaces/errors/ConnectionToDatabaseLostError";

export async function selectUserByEmail(email: string): Promise<User> {
    const db = await connectToDatabase();
    const stmt = await db.prepare('SELECT * FROM USERS WHERE userID = ?');
    await stmt.bind(await getUserID(email));
    const result = await stmt.get<User>();
    if (result === undefined) {
        throw new IdNotFoundError('userID');
    }
    await stmt.finalize();
    await db.close();
    return result;
}
export async function selectResetPasswordCode(email: string): Promise<string> {
    await selectUserByEmail(email);
    const userId = await getUserID(email);
    const db = await connectToDatabase();
    const stmt = await db.prepare('SELECT resetPasswordCode FROM USERS WHERE userID = ?');
    await stmt.bind(userId);
    const result = await stmt.get<{resetPasswordCode: string}>();
    if (result === undefined) {
        throw new IdNotFoundError('userID');
    }
    await stmt.finalize();
    await db.close();
    return result.resetPasswordCode;
}

export async function getUserID(email: string): Promise<number> {
    const db = await connectToDatabase();
    const stmt = await db.prepare('SELECT userID FROM USERS WHERE email = ?');
    await stmt.bind(email);
    const result = await stmt.get<{userID: number}>();
    if (result === undefined) {
        throw new IdNotFoundError('email');
    }
    await stmt.finalize();
    await db.close();
    return result.userID;
}

export async function insertUser(email: string, username: string, password: string): Promise<number> {
    stringLengthCheck(email, 50, 'email');
    stringLengthCheck(username, 50, 'username');
    if (!checkMailFormat(email)) {
        throw new StringWrongFormatError('email');
    } if (!checkPasswordFormat(password)) {
        throw new StringWrongFormatError('password');
    } if (!checkStringFormat(username)) {
        throw new StringWrongFormatError('username');
    }

    const db = await connectToDatabase();
    const stmt = await db.prepare('INSERT INTO USERS (email, username, hashedPassword) values (?, ?, ?);');
    await stmt.bind(email, username, await bcrypt.hash(password, 10));

    try {
        const operationResult = await stmt.run();
        await stmt.finalize();
        return operationResult.lastID!;
    } catch(error: any) {
        if (error.code === 'SQLITE_CONSTRAINT') {
            throw new IdAlreadyExistsError('email');
        } else {
            throw new ConnectionToDatabaseLostError();
        }
    } finally {
        await db.close();
    }
}
export async function insertResetPasswordCode(email: string, code: string): Promise<void> {
    await selectUserByEmail(email);
    const userId = await getUserID(email);
    const db = await connectToDatabase();
    const stmt = await db.prepare('UPDATE USERS SET resetPasswordCode = ? WHERE USERID = ?');
    await stmt.bind(code, userId);
    await stmt.run();
    await stmt.finalize();
    await db.close();
}

export async function updateUser(email: string, password: string): Promise<void> {
    await selectUserByEmail(email);
    if (!checkPasswordFormat(password)) {
        throw new StringWrongFormatError('password');
    }
    await updateSingleColumn('USERS', await getUserID(email), 'userID', 'hashedPassword', await bcrypt.hash(password, 10));
}

export async function deleteResetPasswordCode(email: string): Promise<void> {
    await selectUserByEmail(email);
    await updateSingleColumn('USERS', await getUserID(email), 'userID', 'resetPasswordCode', null);
}
export async function deleteUserByEmail(email: string) {
    await selectUserByEmail(email);
    const db = await connectToDatabase();
    const stmt = await db.prepare('SELECT * FROM TASKLISTS WHERE userID = ?');
    const userID = await getUserID(email);
    await stmt.bind(userID);
    const tasklists = await stmt.all<Tasklist[]>();
    tasklists.forEach((tasklist: Tasklist) => {
        deleteTasklistByTasklistID(tasklist.tasklistID);
    });
    await deleteFromTable("DELETE FROM USERTASKLISTS WHERE userID = ?;", userID);
    await deleteFromTable("DELETE FROM USERS WHERE userID = ?;", userID);
}
