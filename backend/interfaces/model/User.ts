import {Item} from "./Item";

export interface User extends Item {
    username: string,
    hashedPassword: string,
    email: string
}