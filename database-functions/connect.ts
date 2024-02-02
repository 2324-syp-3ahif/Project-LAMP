import sqlite3 from "sqlite3";

export function connectToDatabase() : sqlite3.Database {
    const path = 'database/database.db';
    console.log(path);
    return new sqlite3.Database(path, (err) => {
        if (err) {
            console.error('Error connecting to SQLite database:', err.message);
        } else {
            console.log('Connected to SQLite database:', path);
        }
    });
}

export function disconnectFromDatabase(db: sqlite3.Database) : boolean {
    db.close((err) => {
        if (err) {
            console.error('Error closing SQLite database:', err.message);
            return false;
        }
        console.log('SQLite database connection closed');
    });
    return true;
}
