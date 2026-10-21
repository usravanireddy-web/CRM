const { Pool } = require('pg');
const { env } = require('./env');

const database = new Pool({ connectionString: env.DATABASE_URL });
database.on('error', (error) => console.error('Unexpected PostgreSQL pool error:', error.message));

module.exports = { database };
