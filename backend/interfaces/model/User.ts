import {Item} from "./Item";

export interface User extends Item {
    userID: number,
    username: string,
    hashedPassword: string,
    email: string
}