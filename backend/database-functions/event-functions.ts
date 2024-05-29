import {dateSmallerNowChecker, stringLengthCheck} from "./util-functions";
import {Event} from "../interfaces/model/Event";
import {connectToDatabase} from "./connect";
import {IdNotFoundError} from "../interfaces/errors/IdNotFoundError";
import {MissingParametersError} from "../interfaces/errors/MissingParametersError";
import {getUserID, selectUserByEmail} from "./user-functions";

export async function selectEventByEventID(eventID: number): Promise<Event> {
    const db = await connectToDatabase();
    const stmt = await db.prepare('SELECT * FROM EVENTS WHERE eventID = ?')
    await stmt.bind(eventID);
    const result = await stmt.get<Event>();
    if (result === undefined) {
        throw new IdNotFoundError('EVENTS', 'eventID');
    }
    await stmt.finalize();
    await db.close();
    return result;
}

//TODO: Maybe not throw an error if the user does not exist
export async function selectEventsByEmail(email: string): Promise<Event[]> {
    await selectUserByEmail(email);
    const db = await connectToDatabase();
    const stmt = await db.prepare("SELECT * FROM EVENTS WHERE userID = ?");
    await stmt.bind(await getUserID(email));
    const result = await stmt.all<Event[]>();
    await stmt.finalize();
    await db.close();
    return result;
}

export async function insertEvent(name: string, description: string, startTime: number, endTime: number, fullDay: boolean, email: string): Promise<number> {
    stringLengthCheck(name, 50, 'name');
    stringLengthCheck(description, 255, 'description');
    dateSmallerNowChecker(startTime);
    dateSmallerNowChecker(endTime);
    const userID = await getUserID(email);

    const db = await connectToDatabase();
    const stmt = await db.prepare('INSERT INTO EVENTS (name, startTime, endTime, fullDay, description, userID) values (?1, ?2, ?3, ?4, ?5, ?6)');
    await stmt.bind({1: name, 2: startTime, 3: endTime, 4: fullDay ? 1 : 0, 5: description, 6: userID});
    const operationResult = await stmt.run();
    if (operationResult.lastID === undefined) {
        console.log(operationResult);
        throw new Error('Could not insert event');
    }

    await stmt.finalize();
    await db.close();
    return operationResult.lastID;
}

export async function updateEvent(event: object): Promise<void> {
    let query = 'UPDATE EVENTS SET';
    let eventID: any = undefined;
    let bool = false;
    const values = [];
    for (const [name, value] of Object.entries(event)) {
        if (name !== 'eventID' && value !== undefined) {
            query = query + `${bool ? "," : bool = true} ${name} = ?`;
            values.push(value);
        } else if (name === 'eventID') {
            eventID = value;
        }
    }
    query = query + ` WHERE eventID = ?;`;
    if (values.length === 0) {
        throw new MissingParametersError();
    }
    values.push(eventID);
    await selectEventByEventID(eventID);
    const db = await connectToDatabase();
    const stmt = await db.prepare(query);
    await stmt.bind(...values);
    const operationResult = await stmt.run();
    await stmt.finalize();
    await db.close();
}

export async function deleteEventByID(eventID: number) {
    await selectEventByEventID(eventID);
    const db = await connectToDatabase();
    const stmt = await db.prepare('DELETE FROM EVENTS WHERE eventID = ?');
    await stmt.bind(eventID);
    await stmt.run();
    await stmt.finalize();
    await db.close();
}