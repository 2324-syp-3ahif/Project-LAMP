import sqlite3 from "sqlite3";
import {Tasklist} from "../interfaces/model/Tasklist";
import {deleteTasklistByID} from "./tasklist-functions";
import {
    deleteById,
    deleteFromTable,
    idFound,
    idNotFound,
    select,
    selectRowByID,
    stringLenghtCheck
} from "./util-functions";
import {checkMailFormat, checkPasswordFormat, checkStringFormat} from "../utils";
import {StringWrongFormatError} from "../interfaces/errors/StringWrongFormatError";
import {User} from "../interfaces/model/User";
import bcrypt from "bcrypt";

export async function selectUserByEmail(db: sqlite3.Database, email: string): Promise<User> {
    return await selectRowByID<User>(db, email, 'USERS', 'email');
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

export async function deleteUserByEmail(db: sqlite3.Database, email: string) {
    await idNotFound(db, email, 'USERS', 'email');
    const tasklists = await select<Tasklist>(db, `SELECT * FROM TASKLISTS WHERE email = '${email}';`)
    tasklists.forEach((tasklist: Tasklist) => {
        deleteTasklistByID(db, tasklist.tasklistID);
    });
    await deleteById(db, email, 'email', 'USERS');
    await deleteFromTable(db, `DELETE FROM USERTASKLISTS WHERE email = '${email}';`);
}