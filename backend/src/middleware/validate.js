"use strict";
const Joi = require('joi');
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateBody = validateBody;
exports.validateRecordId = validateRecordId;
function validateBody(schema, options = {}) {
    return (request, response, next) => {
        const { error, value } = schema.validate(request.body, { abortEarly: false, stripUnknown: true, convert: true, ...options });
        if (error) {
            response.status(400).json({
                success: false,
                error: { code: 'VALIDATION_ERROR', message: 'Please check the submitted fields', details: error.details.map((item) => ({ field: item.path.join('.'), message: item.message })) },
            });
            return;
        }
        request.body = value;
        next();
    };
}

const recordIdSchema = Joi.object({ id: Joi.number().integer().positive().required() });

function validateRecordId(request, response, next) {
    const { error } = recordIdSchema.validate({ id: request.params.id }, { abortEarly: true, convert: true });
    if (error) {
        response.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Record ID must be a positive number' } });
        return;
    }
    next();
}
