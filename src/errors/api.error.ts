

export class ApiError extends Error {
    status: number;
    details?: string;

    constructor(message: string, status: number, details?: string) {
        super(message);
        this.status = status;
        this.details = details;
    }
}


export class BadRequestError extends ApiError {
    constructor(message: string, details?: string) {
        super(message, 400, details);
    }
}


export class NotFoundError extends ApiError {
    constructor(message: string, details?: string) {
        super(message, 404, details);
    }
}


export class ConflictError extends ApiError {
    constructor(message: string, details?: string) {
        super(message, 409, details);
    }
}


export class UnauthorizedError extends ApiError {
    constructor(message: string, details?: string) {
        super(message, 401, details);
    }
}


export class InternalServerError extends ApiError {
    constructor(message: string, details?: string) {
        super(message, 500, details);
    }
}