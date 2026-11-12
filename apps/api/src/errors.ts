export class AppError extends Error {
    readonly status: number
    readonly code: string
    readonly details?: unknown

    constructor(status: number, code: string, message: string, details?: unknown) {
        super(message)
        this.name = 'AppError'
        this.status = status
        this.code = code
        this.details = details
    }
}

export class NotFoundError extends AppError {
    constructor(message = 'Resource not found') {
        super(404, 'NOT_FOUND', message)
    }
}

export class ValidationError extends AppError {
    constructor(details: unknown) {
        super(400, 'VALIDATION_ERROR', 'Request validation failed', details)
    }
}
