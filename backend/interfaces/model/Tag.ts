import {Item} from "./Item";

export interface Tag extends Item {
    tagID: number,
    name: string,
}