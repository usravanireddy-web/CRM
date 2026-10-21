const { database } = require('../config/database');

const resources = {
  leads: { table: 'crm_leads', fields: ['firstName', 'lastName', 'company', 'email', 'phone', 'source', 'status', 'owner', 'nextFollowUp'], search: ['first_name', 'last_name', 'company', 'email'] },
  companies: { table: 'crm_companies', fields: ['name', 'website', 'industry', 'employeeCount', 'country', 'city', 'status'], search: ['name', 'website', 'industry', 'city', 'country'] },
  contacts: { table: 'crm_contacts', fields: ['firstName', 'lastName', 'email', 'phone', 'company', 'title', 'status'], search: ['first_name', 'last_name', 'email', 'company', 'title'] },
  deals: { table: 'crm_deals', fields: ['name', 'company', 'leadId', 'stage', 'amount', 'currency', 'expectedCloseDate', 'owner'], search: ['name', 'company', 'stage', 'owner'] },
  tasks: { table: 'crm_tasks', fields: ['title', 'description', 'relatedTo', 'dueAt', 'priority', 'status', 'assignee'], search: ['title', 'description', 'related_to', 'assignee'] },
};

function columnName(field) { return field.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`); }
function toRecord(row) {
  return Object.fromEntries(Object.entries(row)
    .filter(([key]) => key !== 'legacy_uuid')
    .map(([key, value]) => [key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase()), value]));
}

function recordRepository(resourceName) {
  const resource = resources[resourceName];
  if (!resource) throw new Error(`Unknown CRM resource: ${resourceName}`);

  const userColumn = { leads: 'owner_user_id', deals: 'owner_user_id', tasks: 'assignee_user_id' }[resourceName];
  function scopeFor(user) {
    return userColumn && ['sales_rep', 'telecaller', 'lead_researcher'].includes(user?.role)
      ? { column: userColumn, id: user.id }
      : null;
  }

  return {
    async list(search = '', page = 1, pageSize = 25, user) {
      const params = [];
      const filters = [];
      if (search.trim()) {
        params.push(`%${search.trim()}%`);
        filters.push(`(${resource.search.map((column) => `${column} ILIKE $1`).join(' OR ')})`);
      }
      const scope = scopeFor(user);
      if (scope) { params.push(scope.id); filters.push(`${scope.column} = $${params.length}`); }
      const where = filters.length ? `WHERE ${filters.join(' AND ')}` : '';
      const count = await database.query(`SELECT COUNT(*)::int AS total FROM ${resource.table} ${where}`, params);
      params.push(pageSize, (page - 1) * pageSize);
      const rows = await database.query(`SELECT * FROM ${resource.table} ${where} ORDER BY created_at DESC LIMIT $${params.length - 1} OFFSET $${params.length}`, params);
      return { rows: rows.rows.map(toRecord), total: count.rows[0].total };
    },
    async get(id, user) {
      const scope = scopeFor(user);
      const result = await database.query(`SELECT * FROM ${resource.table} WHERE id = $1${scope ? ` AND ${scope.column} = $2` : ''}`, scope ? [id, scope.id] : [id]);
      return result.rows[0] ? toRecord(result.rows[0]) : null;
    },
    async create(data, user) {
      const fields = resource.fields.filter((field) => data[field] !== undefined);
      const columns = fields.map(columnName);
      const values = fields.map((field) => data[field] === '' ? null : data[field]);
      if (resourceName === 'leads' || resourceName === 'deals') { columns.push('owner_user_id'); values.push(user.id); }
      if (resourceName === 'tasks') { columns.push('assignee_user_id'); values.push(user.id); }
      const placeholders = values.map((_, index) => `$${index + 1}`);
      const result = await database.query(`INSERT INTO ${resource.table} (${columns.join(', ')}) VALUES (${placeholders.join(', ')}) RETURNING *`, values);
      return toRecord(result.rows[0]);
    },
    async update(id, data, user) {
      const fields = resource.fields.filter((field) => data[field] !== undefined);
      if (!fields.length) return this.get(id, user);
      const sets = fields.map((field, index) => `${columnName(field)} = $${index + 1}`);
      const values = fields.map((field) => data[field] === '' ? null : data[field]);
      values.push(id);
      const scope = scopeFor(user);
      if (scope) values.push(scope.id);
      const result = await database.query(`UPDATE ${resource.table} SET ${sets.join(', ')}, updated_at = NOW() WHERE id = $${values.length - (scope ? 1 : 0)}${scope ? ` AND ${scope.column} = $${values.length}` : ''} RETURNING *`, values);
      return result.rows[0] ? toRecord(result.rows[0]) : null;
    },
    async remove(id, user) {
      const scope = scopeFor(user);
      const result = await database.query(`DELETE FROM ${resource.table} WHERE id = $1${scope ? ` AND ${scope.column} = $2` : ''}`, scope ? [id, scope.id] : [id]);
      return result.rowCount > 0;
    },
  };
}

module.exports = { recordRepository };
