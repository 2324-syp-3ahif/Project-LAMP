import sqlite3 from "sqlite3";

import {
    dateFormatCheck,
    dateSmallerNowChecker,
    deleteById, getMaxId,
    idNotFound, select,
    selectRowByID,
    stringLenghtCheck, updateSingleColumn
} from "./util-functions";
import {User} from "../interfaces/model/User";
import {Event} from "../interfaces/model/Event";

export async function selectEventByEventID(db: sqlite3.Database, eventID: number): Promise<Event> {
    return await selectRowByID<Event>(db, eventID, 'EVENTS', 'eventID');
}

export async function selectEventsByEmail(db: sqlite3.Database, email: string): Promise<Event[]> {
    await idNotFound<User>(db, email, 'USERS', 'email');
    return await select<Event>(db, `SELECT * FROM EVENTS WHERE email = '${email}'`);
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

export async function deleteEventByID(db: sqlite3.Database, eventID: number) {
    await idNotFound(db, eventID, 'EVENTS', 'eventID');
    await deleteById(db, eventID, 'eventID', 'EVENTS');
}