import sqlite3 from "sqlite3";
import {connectToDatabase, disconnectFromDatabase} from "./connect";

export function createTasksTable() : boolean {
    const db : sqlite3.Database = connectToDatabase();
    const query = `
        CREATE TABLE IF NOT EXISTS TASKS(
          taskID int primary key,
          title varchar(255),
          description varchar(255),
          dueDate Date,
          priority number,
          isComplete boolean,
          tasklistID int NOT NULL,
          userID int NOT NULL
          );
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

export function createTasklistsTable() : boolean {
    const db : sqlite3.Database = connectToDatabase();
    const query = `
        CREATE TABLE IF NOT EXISTS TASKLISTS(
          tasklistID int primary key,
          title varchar(255),
          description varchar(255),
          sortingOrder BIT(4),
          priority BIT(4),
          isLocked boolean,
          owner int NOT NULL
          );
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

export function createTagsTable() : boolean {
    const db : sqlite3.Database = connectToDatabase();
    const query = `
        CREATE TABLE IF NOT EXISTS TAGS(
          tagID int primary key,
           name varchar(50)
          );
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

export function createTagTasklistsTable() : boolean {
    const db : sqlite3.Database = connectToDatabase();
    const query = `
        CREATE TABLE IF NOT EXISTS TAGTASKLISTS(
          tasklistID int NOT NULL,
          tagID int NOT NULL
          );
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

export function createUserTasklistTable() : boolean {
    const db : sqlite3.Database = connectToDatabase();
    const query = `
        CREATE TABLE IF NOT EXISTS USERTASKLISTS(
            tasklistID int NOT NULL,
            userID int NOT NULL
          );
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

export function createUsersTable() : boolean {
    const db : sqlite3.Database = connectToDatabase();
    const query = `
        CREATE TABLE IF NOT EXISTS USERS(
            userID int primary key,
            username varchar(50),
            hashedPassword varchar(50),
            email varchar(50)
          );
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

export function createEventsTable() : boolean {
    const db : sqlite3.Database = connectToDatabase();
    const query = `
        CREATE TABLE IF NOT EXISTS EVENTS(
            eventID int primary key,
            name varchar(50),
            startTime Date,
            endTime Date,
            fullDay boolean,
            description varchar(255),
            userID int NOT NULL
          );
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