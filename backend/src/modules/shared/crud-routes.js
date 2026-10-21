"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createCrudRoutes = createCrudRoutes;
const express_1 = require("express");
const validate_1 = require("../../middleware/validate");
const { requirePermission } = require("../../middleware/authorization");
function createCrudRoutes(controller, createSchema, resource) {
    const router = (0, express_1.Router)();
    const updateSchema = createSchema.fork(Object.keys(createSchema.describe().keys ?? {}), (field) => field.optional()).min(1);
    router.get('/', requirePermission(`${resource}:read`), controller.list);
    router.post('/', requirePermission(`${resource}:create`), (0, validate_1.validateBody)(createSchema), controller.create);
    router.get('/:id', requirePermission(`${resource}:read`), validate_1.validateRecordId, controller.get);
    router.patch('/:id', requirePermission(`${resource}:update`), validate_1.validateRecordId, (0, validate_1.validateBody)(updateSchema, { noDefaults: true }), controller.update);
    router.delete('/:id', requirePermission(`${resource}:delete`), validate_1.validateRecordId, controller.remove);
    return router;
}
