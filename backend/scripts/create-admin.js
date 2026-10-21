require('dotenv').config();
const readline = require('node:readline/promises');
const { stdin, stdout } = require('node:process');
const bcrypt = require('bcryptjs');
const { database } = require('../src/config/database');
const { askVisiblePassword, validatePassword } = require('./password-input');

async function main() {
  const terminal = readline.createInterface({ input: stdin, output: stdout });
  let fullName;
  let email;
  try {
    fullName = (await terminal.question('Administrator name: ')).trim();
    email = (await terminal.question('Administrator email: ')).trim().toLowerCase();
  } finally {
    terminal.close();
  }

  const password = await askVisiblePassword('Administrator password (8-64 characters; input will be visible): ');
  validatePassword(password);

  const role = await database.query("SELECT id FROM crm_roles WHERE role_key = 'admin'");
  if (!role.rowCount) throw new Error('Roles are missing. Run npm.cmd run db:migrate first.');
  const hash = await bcrypt.hash(password, 12);
  await database.query(
    'INSERT INTO crm_users(role_id, full_name, email, password_hash) VALUES($1,$2,$3,$4)',
    [role.rows[0].id, fullName, email, hash],
  );
  console.log('Administrator account created. Sign in through the CRM login screen.');
}

main().catch((error) => {
  if (error.code === '23505' && error.constraint === 'crm_users_email_key') {
    console.error('An account with this email already exists. To set a new password for an Administrator, run npm.cmd run admin:reset-password.');
  } else {
    console.error('Administrator setup failed:', error.message);
  }
  process.exitCode = 1;
}).finally(() => database.end());
