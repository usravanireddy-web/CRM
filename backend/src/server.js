const { app } = require('./app');
const { database } = require('./config/database');
const { env } = require('./config/env');

let server;

async function start() {
  try {
    await database.query('SELECT 1');
    console.log('PostgreSQL connection established.');

    server = app.listen(env.PORT, () => {
      console.log(`Velvorax CRM API listening on http://localhost:${env.PORT}`);
    });
    server.on('error', async (error) => {
      if (error.code === 'EADDRINUSE') {
        console.error(`Port ${env.PORT} is already in use by another process.`);
        console.error(`Stop the existing CRM server with Ctrl+C in its terminal, or identify and stop the process listening on port ${env.PORT}.`);
        console.error(`If you need both servers, set a different PORT in backend/.env and update VITE_API_BASE_URL in frontend/.env to match.`);
      } else {
        console.error('The API server could not start:', error.message);
      }
      await database.end();
      process.exitCode = 1;
    });
  } catch (error) {
    console.error('Database connection failed:', error.message);
    await database.end();
    process.exitCode = 1;
  }
}

async function shutdown() {
  if (server) {
    server.close(async () => {
      await database.end();
      process.exit(0);
    });
    return;
  }
  await database.end();
  process.exit(0);
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
start();
