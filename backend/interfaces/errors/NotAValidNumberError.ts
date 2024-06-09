export class NotAValidNumberError extends Error {
    constructor(message?: string, ) {
        super(message);

        this.name = 'NotAValidNumberError';
        this.message = message ?? "";
    }
}