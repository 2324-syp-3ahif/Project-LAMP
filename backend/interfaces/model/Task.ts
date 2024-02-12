import {Item} from "./Item";

export interface Task extends Item {
    taskID: number,
    title: string,
    dueDate: Date,
    priority: number,
    description: string,
    isComplete: boolean,
    tasklistID: number,
}