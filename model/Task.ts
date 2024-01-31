import {Tasklist} from "./Tasklist";

export interface Task {
    name: string,
    dueDate: Date,
    priority: number,
    description: string,
    tasklist: Tasklist,
}