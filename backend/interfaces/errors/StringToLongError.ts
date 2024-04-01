export class StringToLongError extends Error {
    constructor(public causer: string,
                message?: string) {
        super(message);
    }
}