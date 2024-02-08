export class IdNotFoundError extends Error {
    constructor(public causer: string,
                message?: string, ) {
        super(message);

        this.name = 'IdNotFoundError';
        this.message = message ?? "";
    }
}