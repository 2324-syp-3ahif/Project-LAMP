import * as crypto from 'crypto';

export function checkMailFormat(mail: string): boolean{
    const regex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
    return regex.test(mail);
}

export function checkPasswordFormat(password: string): boolean{
    const regex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;
    return regex.test(password);
}

export function checkStringFormat(username: string): boolean{
    const regex = /^[a-zA-Z0-9]{3,}$/;
    return regex.test(username);
}

export function checkDateFormat(date: string): boolean {
    const d = new Date(date);
    return d.toString() != "Invalid Date";
}

export function hashString(str: string): string{
    const hash = crypto.createHash('sha256');
    hash.update(str);
    return hash.digest('hex');
}

export function generateWarningPopUp(message: string, errorCode: number): void{
    alert("Error " + errorCode + ": " + message);
}

export function convertTSToSQLDate(date: Date): string {
    return `${date.getDay()}-${date.getMonth()}-${date.getFullYear()} ${date.getHours()}:${date.getMinutes()}:0`;
}

export function convertSQLToTSDate(date: string): Date {
    return new Date();
}