"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const promises_1 = require("node:fs/promises");
const node_path_1 = require("node:path");
const database_1 = require("../config/database");
async function migrate() {
    const migrationsDirectory = (0, node_path_1.join)(__dirname, 'migrations');
    const files = (await (0, promises_1.readdir)(migrationsDirectory)).filter((file) => file.endsWith('.sql')).sort();
    const client = await database_1.database.connect();
    try {
        await client.query('CREATE TABLE IF NOT EXISTS schema_migrations (id TEXT PRIMARY KEY, applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW())');
        for (const file of files) {
            const existing = await client.query('SELECT id FROM schema_migrations WHERE id = $1', [file]);
            if (existing.rowCount)
                continue;
            const sql = await (0, promises_1.readFile)((0, node_path_1.join)(migrationsDirectory, file), 'utf8');
            await client.query('BEGIN');
            try {
                await client.query(sql);
                await client.query('INSERT INTO schema_migrations (id) VALUES ($1)', [file]);
                await client.query('COMMIT');
                console.log(`Applied migration ${file}`);
            }
            catch (error) {
                await client.query('ROLLBACK');
                throw error;
            }
        }
        console.log('Database migrations are up to date.');
    }
    finally {
        client.release();
        await database_1.database.end();
    }
}
migrate().catch((error) => {
    console.error('Migration failed:', error instanceof Error ? error.message : error);
    process.exitCode = 1;
});
