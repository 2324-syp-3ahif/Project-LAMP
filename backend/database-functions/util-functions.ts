import {DateExpiredError} from "../interfaces/errors/DateExpiredError";
import {StringToLongError} from "../interfaces/errors/StringToLongError";
import {NotAValidNumberError} from "../interfaces/errors/NotAValidNumberError";
import {connectToDatabase} from "./connect";

export async function deleteFromTable(query: string, ...params: any[]): Promise<void> {
    const db = await connectToDatabase();
    const stmt = await db.prepare(query);
    await stmt.bind(...params);
    await stmt.run();
    await stmt.finalize();
    await db.close();
}

export function dateSmallerNowChecker(dueDate: number) {
    if (dueDate <= Date.now()) {
        throw new DateExpiredError("Date already happened");
    }
}

export function stringLengthCheck(field: string, length: number, causer: string) {
    if (field.length > length) {
        throw new StringToLongError(`${causer} cannot have more characters than ${length}`);
    }
}

export function numberChecker(num: number, min: number, max: number, message: string) {
    if (num < min || num > max) {
        throw new NotAValidNumberError(message);
    }
}

export async function updateSingleColumn(tablename: string, id: number | string, idName: string, column: string, value: any): Promise<void> {
    const db = await connectToDatabase();
    const stmt = await db.prepare(`UPDATE ${tablename} SET ${column} = ? WHERE ${idName} IS ?;`);
    await stmt.bind(value, id);
    await stmt.run();
    await stmt.finalize();
    await db.close();
}

export async function dropTable(tableName: string) {
    const db = await connectToDatabase();
    await db.run('DROP TABLE IF EXISTS ' + tableName);
    await db.close();
    console.log(`Table ${tableName} dropped`);
}
