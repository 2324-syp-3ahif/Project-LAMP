import {Tasklist} from "../interfaces/model/Tasklist";
import {deleteTasklistByTasklistID} from "./tasklist-functions";
import {deleteFromTable, stringLenghtCheck, updateSingleColumn} from "./util-functions";
import {checkMailFormat, checkPasswordFormat, checkStringFormat} from "../utils";
import {StringWrongFormatError} from "../interfaces/errors/StringWrongFormatError";
import {User} from "../interfaces/model/User";
import bcrypt from "bcrypt";
import {connectToDatabase} from "./connect";
import {IdNotFoundError} from "../interfaces/errors/IdNotFoundError";
import {IdAlreadyExistsError} from "../interfaces/errors/IdAlreadyExistsError";
import {ConnectionToDatabaseLostError} from "../interfaces/errors/ConnectionToDatabaseLostError";

export async function selectUserByUserID(userID: number): Promise<User> {
    const db = await connectToDatabase();
    const stmt = await db.prepare('SELECT * FROM USERS WHERE userID = ?')
    await stmt.bind(userID);
    const result = await stmt.get<User>();
    if (result === undefined) {
        throw new IdNotFoundError('USERS', 'userID');
    }
    await stmt.finalize();
    await db.close();
    return result;
}

export async function insertUser(email: string, username: string, password: string): Promise<number> {
    stringLenghtCheck(email, 50, 'email');
    stringLenghtCheck(username, 50, 'username');
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

export async function updateUser(userID: number, password: string): Promise<void> {
    await selectUserByUserID(userID);
    if (!checkPasswordFormat(password)) {
        throw new StringWrongFormatError('password');
    }
    await updateSingleColumn('USERS', userID, 'userID', 'hashedPassword', await bcrypt.hash(password, 10));
}

export async function deleteUserByUserID(userID: number) {
    await selectUserByUserID(userID);
    const db = await connectToDatabase();
    const stmt = await db.prepare('SELECT * FROM TASKLISTS WHERE userID = ?');
    await stmt.bind(userID);
    const tasklists = await stmt.all<Tasklist[]>();
    tasklists.forEach((tasklist: Tasklist) => {
        deleteTasklistByTasklistID(tasklist.tasklistID);
    });
    await deleteFromTable("DELETE FROM USERTASKLISTS WHERE userID = ?;", userID);
    await deleteFromTable("DELETE FROM USERS WHERE userID = ?;", userID);
}
