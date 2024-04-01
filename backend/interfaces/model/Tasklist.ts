import {Task} from "./Task";
import {Tag} from "./Tag";
import {Item} from "./Item";

export interface Tasklist extends Item{
    tasklistID: number,
    title: string,
    description: string,
    sortingOrder: number,
    priority: number,
    isLocked: boolean,
    ownerID: number
}