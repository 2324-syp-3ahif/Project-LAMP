export class NotAValidNumberError extends Error {
    constructor(public causer: string,
                message?: string, ) {
        super(message);

        this.name = 'NotAValidNumberError';
        this.message = message ?? "";
    }
}