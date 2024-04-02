import {Item} from "./Item";

export interface Event extends Item{
    eventID: number,
    name: string,
    startTime: Date,
    endTime: Date,
    fullDay: boolean,
    description: string,
    userID: number,
}