export class DateFormatError extends Error {
    constructor(public causer: string, message?: string) {
        super(message);
    }
}