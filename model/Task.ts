import {Tasklist} from "./Tasklist";

export interface Task {
    task_id: number,
    name: string,
    dueDate: Date,
    priority: number,
    description: string,
    tasklist_id: number,
}