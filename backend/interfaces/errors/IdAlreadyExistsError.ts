export class IdAlreadyExistsError extends Error {
    constructor(public causer: string,
                message?: string, ) {
        super(message);

        this.name = 'IdAlreadyExistsError';
        this.message = message ?? "";
    }
}