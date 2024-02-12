import sqlite3 from "sqlite3";

export function updateTask(db: sqlite3.Database, taskID: number, title?: string, description?: string, dueDate?: Date, priority?: number, isComplete?: boolean, tasklistID?: number): Promise<void> {
    
}

function updateSingleColumn(db: sqlite3.Database, tablename: string, id: number, idName: string, row: string, value: any): Promise<void> {
    return new Promise((resolve, reject) => {
        const query: string = `UPDATE ${tablename} SET ${row} = ${value} WHERE ${idName} = ${id};`;
        db.run(query, (err) => {
            if (err) {

            }
        })
    });
}
