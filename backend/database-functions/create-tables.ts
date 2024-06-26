import {connectToDatabase} from "./connect";

export async function createTables() {
    await createTasksTable();
    await createTasklistsTable();
    await createTagsTable();
    await createTagTasklistsTable();
    await createUserTasklistTable();
    await createUsersTable();
    await createEventsTable();
}

async function createTasksTable() {
    const db = await connectToDatabase();
    await db.run(`
        CREATE TABLE IF NOT EXISTS TASKS(
          taskID INTEGER primary key AUTOINCREMENT,
          title TEXT,
          description TEXT,
          dueDate INTEGER,
          priority INTEGER,
          isComplete INTEGER,
          tasklistID INTEGER NOT NULL,
          userID INTEGER NOT NULL,
          FOREIGN KEY(userID) REFERENCES USERS(userID),
          FOREIGN KEY(tasklistID) REFERENCES TASKLISTS(tasklistID)
          ) strict;`);
    await db.close();
}

async function createTasklistsTable() {
    const db = await connectToDatabase();
    await db.run(`
        CREATE TABLE IF NOT EXISTS TASKLISTS(
          tasklistID INTEGER primary key AUTOINCREMENT,
          title TEXT,
          description TEXT,
          sortingOrder INTEGER,
          priority INTEGER,
          isLocked INTEGER,
          userID INTEGER NOT NULL, 
          lastViewed INTEGER,
          creationDate INTEGER,
          FOREIGN KEY(userID) REFERENCES USERS(userID)
          ) strict;`);
    await db.close();
}

async function createTagsTable() {
    const db = await connectToDatabase();
    await db.run(`
        CREATE TABLE IF NOT EXISTS TAGS(
          tagID INTEGER primary key AUTOINCREMENT,
          name TEXT,
          userID INTEGER,
          FOREIGN KEY(userID) REFERENCES USERS(userID)
        ) strict;`);
    await db.close();
}

async function createTagTasklistsTable() {
    const db = await connectToDatabase();
    await db.run(`
        CREATE TABLE IF NOT EXISTS TAGTASKLISTS(
          tasklistID INTEGER NOT NULL,
          tagID INTEGER NOT NULL,
          FOREIGN KEY(tasklistID) REFERENCES TASKLISTS(tasklistID),
          FOREIGN KEY(tagID) REFERENCES TAGS(tagID)
          ) strict;`);
    await db.close();
}

async function createUserTasklistTable() {
    const db = await connectToDatabase();
    await db.run(` 
        CREATE TABLE IF NOT EXISTS USERTASKLISTS(
            tasklistID INTEGER NOT NULL,
            userID INTEGER NOT NULL,
            FOREIGN KEY(tasklistID) REFERENCES TASKLISTS(tasklistID),
            FOREIGN KEY(userID) REFERENCES USERS(userID)
          ) strict;`);
    await db.close();
}

async function createUsersTable() {
    const db = await connectToDatabase();
    await db.run(`
        CREATE TABLE IF NOT EXISTS USERS(
            userID INTEGER primary key AUTOINCREMENT,
            username TEXT,
            hashedPassword TEXT,
            email TEXT UNIQUE,
            resetPasswordCode TEXT
          ) strict;`);
    await db.close();
}

async function createEventsTable() {
    const db = await connectToDatabase();
    await db.run(`
        CREATE TABLE IF NOT EXISTS EVENTS(
            eventID INTEGER primary key AUTOINCREMENT,
            name TEXT,
            startTime INTEGER,
            endTime INTEGER,
            fullDay INTEGER,
            description TEXT,
            userID INTEGER NOT NULL,  
	    FOREIGN KEY(userID) REFERENCES USERS(userID)
          ) strict;`);
    await db.close();
}