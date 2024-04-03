import {Task} from "./Task";
import {Tag} from "./Tag";
export interface Tasklist {
    tasklistID: number,
    title: string,
    description: string,
    sortingOrder: number,
    priority: number,
    isLocked: boolean,
    ownerID: number
}