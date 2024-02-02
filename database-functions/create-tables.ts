import sqlite3 from "sqlite3";
import {connectToDatabase, disconnectFromDatabase} from "./connect";

export function createTasksTable() : boolean {
    const db : sqlite3.Database = connectToDatabase();
    const query = `
        CREATE TABLE IF NOT EXISTS TASK(
          task_id int primary key,
          dueDate Date,
          description varchar(255),
          priority number,
          isComplete boolean,
          title varchar(255),
          tasklist_id int NOT NULL CONSTRAINT TASKLIST_FOREIGN_KEY REFERENCES TASKLIST(tasklist_id));
        `;
    db.run(query, (err) => {
        if (err) {
            console.log("Failed creation!" + err.message);
            return false;
        }
        console.log("Successfully created TASKS");
    });
    disconnectFromDatabase(db);
    return true;
}

export function createTasklistTable() : boolean {
    const db : sqlite3.Database = connectToDatabase();
    const query = `
        CREATE TABLE IF NOT EXISTS TASKLIST(
          tasklist_id int primary key,
          title varchar(255),
          description varchar(255),
          sortingOrder byte,
          priority byte,
          isComplete boolean,
          task_id int NOT NULL CONSTRAINT TASKLIST_FOREIGN_KEY REFERENCES TASKS(task_id));
        `;
    db.run(query, (err) => {
        if (err) {
            console.log("Failed creation!" + err.message);
            return false;
        }
        console.log("Successfully created TASKS");
    });
    disconnectFromDatabase(db);
    return true;
}