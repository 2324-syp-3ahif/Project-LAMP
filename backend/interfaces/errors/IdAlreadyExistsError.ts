export class IdAlreadyExistsError extends Error {
    constructor(message?: string, ) {
        super(message);

        this.name = 'IdAlreadyExistsError';
        this.message = message ?? "";
    }
}