import {Task} from "./Task";
import {Tag} from "./Tag";

export interface Tasklist {
    name: string,
    tags: Tag[],
    description: string,
    tasks: Task[]
}