import sqlite3 from "sqlite3";
import {promisify} from "util";
import {IdNotFoundError} from "../interfaces/errors/IdNotFoundError";
import {IdAlreadyExistsError} from "../interfaces/errors/IdAlreadyExistsError";
import {DateExpiredError} from "../interfaces/errors/DateExpiredError";
import {StringToLongError} from "../interfaces/errors/StringToLongError";
import {checkDateFormat} from "../utils";
import {DateFormatError} from "../interfaces/errors/DateFormatError";
import {NotAValidNumberError} from "../interfaces/errors/NotAValidNumberError";

export async function selectRowByID<T>(db: sqlite3.Database, tableID: number | string, tablename: string, idName: string): Promise<T> {
    const dbFunction = promisify(db.get.bind(db));
    const query = `SELECT * FROM ${tablename} WHERE ${idName} IS ${(typeof tableID === 'string' ? `'${tableID}'` : tableID)}`;
    const data = await dbFunction(query);
    if (data === undefined) {
        throw new IdNotFoundError(idName, `No id found in ${tablename}`);
    }
    return data as T;
}

export async function select<T>(db: sqlite3.Database, query: string): Promise<T[]> {
    const dbFunction = promisify(db.all.bind(db));
    const data = await dbFunction(query);
    if (data === undefined) {
        throw new IdNotFoundError("", `No id found for query: '${query}'`);
    }
    return data as T[];
}

interface Row {
    maxId: number
}

export async function getMaxId(db: sqlite3.Database, tablename: string, idname: string): Promise<number> {
    const dbFunction = promisify(db.get.bind(db));
    const data: Row = await dbFunction(`SELECT MAX(${idname}) AS maxId FROM ${tablename}`) as Row;
    return data.maxId !== null ? data.maxId : 0;
}

export async function deleteById(db: sqlite3.Database, id: number | string, idname: string, tablename: string): Promise<void> {
    const dbFunction = promisify(db.run.bind(db));
    const query= `DELETE FROM ${tablename} WHERE ${idname} = ${(typeof id === "string" ? "'" + id + "'" : id)}`;
    await dbFunction(query);
}

export async function deleteFromTable(db: sqlite3.Database, query: string): Promise<void> {
    const dbFunction = promisify(db.run.bind(db));
    await dbFunction(query);
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

export function updateSingleColumn(db: sqlite3.Database, tablename: string, id: number | string, idName: string, row: string, value: any): void {
    if (typeof value === 'string') {
        value = `'${value}'`;
    }
    if (typeof id === 'string') {
        id = `'${id}'`;
    }
    const query: string = `UPDATE ${tablename} SET ${row} = ${value} WHERE ${idName} IS ${id};`;
    db.run(query);
}