function asyncRoute(handler) {
  return (request, response, next) => Promise.resolve(handler(request, response)).catch(next);
}

function createCrudController(service) {
  return {
    list: asyncRoute(async (request, response) => {
      const page = Math.max(1, Number(request.query.page) || 1);
      const pageSize = Math.min(100, Math.max(1, Number(request.query.pageSize) || 25));
      const result = await service.list(String(request.query.search ?? ''), page, pageSize, request.user);
      response.json({ success: true, data: result.rows, meta: { page, pageSize, total: result.total }, message: 'Records loaded' });
    }),
    get: asyncRoute(async (request, response) => {
      const item = await service.get(String(request.params.id), request.user);
      if (!item) return response.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Record not found' } });
      return response.json({ success: true, data: item, meta: {}, message: 'Record loaded' });
    }),
    create: asyncRoute(async (request, response) => {
      const item = await service.create(request.body, request.user);
      response.status(201).json({ success: true, data: item, meta: {}, message: 'Record created' });
    }),
    update: asyncRoute(async (request, response) => {
      const item = await service.update(String(request.params.id), request.body, request.user);
      if (!item) return response.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Record not found' } });
      return response.json({ success: true, data: item, meta: {}, message: 'Record updated' });
    }),
    remove: asyncRoute(async (request, response) => {
      const removed = await service.remove(String(request.params.id), request.user);
      if (!removed) return response.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Record not found' } });
      return response.status(204).send();
    }),
  };
}

module.exports = { createCrudController };
