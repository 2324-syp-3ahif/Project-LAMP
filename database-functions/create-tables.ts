import sqlite3 from "sqlite3";
import {connectToDatabase} from "./connect";

export function createTasksTable() : boolean {
    const db : sqlite3.Database = connectToDatabase();
    const query = `
        CREATE TABLE IF NOT EXISTS TASKS(
          taskID int primary key AUTOINCREMENT,
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
    return true;
}

export function createTasklistsTable() : boolean {
    const db : sqlite3.Database = connectToDatabase();
    const query = `
        CREATE TABLE IF NOT EXISTS TASKLISTS(
          tasklistID int primary key AUTOINCREMENT,
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
        console.log("Successfully created TASKLISTS");
    });
    return true;
}

export function createTagsTable() : boolean {
    const db : sqlite3.Database = connectToDatabase();
    const query = `
        CREATE TABLE IF NOT EXISTS TAGS(
          tagID int primary key AUTOINCREMENT,
           name varchar(50)
          );
        `;
    db.run(query, (err) => {
        if (err) {
            console.log("Failed creation!" + err.message);
            return false;
        }
        console.log("Successfully created TAGS");
    });
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
        console.log("Successfully created TAGTASKLISTS");
    });
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
        console.log("Successfully created USERTASKLISTS");
    });
    return true;
}

export function createUsersTable() : boolean {
    const db : sqlite3.Database = connectToDatabase();
    const query = `
        CREATE TABLE IF NOT EXISTS USERS(
            userID int primary key AUTOINCREMENT,
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
        console.log("Successfully created USERS");
    });
    return true;
}

export function createEventsTable() : boolean {
    const db : sqlite3.Database = connectToDatabase();
    const query = `
        CREATE TABLE IF NOT EXISTS EVENTS(
            eventID int primary key AUTOINCREMENT,
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
        console.log("Successfully created EVENTS");
    });
    return true;
}