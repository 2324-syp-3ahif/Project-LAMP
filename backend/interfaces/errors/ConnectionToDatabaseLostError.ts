export class ConnectionToDatabaseLostError extends Error {
    constructor() {
        super();
        this.name = 'ConnectionToDatabaseLostError';
    }
}