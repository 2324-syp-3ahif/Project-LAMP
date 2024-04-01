export class StringWrongFormatError extends Error {
    constructor(public causer: string,
                message?: string) {
        super(message);
    }
}