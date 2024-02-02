import {connectToDatabase} from "./connect";

export function dropTable(tableName: string) {
    const db = connectToDatabase();
    const query: string = `DROP TABLE ${tableName};`;
    db.run(query, [], (err) => {
        if (err) {
            console.log(err.message);
        } else {
            console.log("Table dropped!");
        }
    })
}