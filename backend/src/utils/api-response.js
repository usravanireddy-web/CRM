"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.success = success;
function success(response, data, message = 'Request completed') {
    return response.json({ success: true, data, meta: {}, message });
}
