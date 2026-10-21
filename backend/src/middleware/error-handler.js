"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = void 0;
const errorHandler = (error, _request, response, _next) => {
    const databaseErrors = {
        '23505': [409, 'CONFLICT', 'A record with these details already exists.'],
        '23503': [400, 'INVALID_REFERENCE', 'The selected related record does not exist.'],
        '22P02': [400, 'INVALID_ID', 'The supplied record ID is invalid.'],
        '23514': [400, 'CONSTRAINT_VIOLATION', 'The submitted values do not meet a database rule.'],
    };
    const [status, code, message] = databaseErrors[error?.code] ?? [500, 'INTERNAL_SERVER_ERROR', 'Something went wrong. Please try again.'];
    console.error(`API error ${code}`);
    response.status(status).json({ success: false, error: { code, message } });
};
exports.errorHandler = errorHandler;
