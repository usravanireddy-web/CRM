require('dotenv').config();
const readline = require('node:readline/promises');
const { stdin, stdout } = require('node:process');
const bcrypt = require('bcryptjs');
const { database } = require('../src/config/database');
const { askVisiblePassword, validatePassword } = require('./password-input');

async function main() {
  const terminal = readline.createInterface({ input: stdin, output: stdout });
  let email;
  try {
    email = (await terminal.question('Administrator email: ')).trim().toLowerCase();
  } finally {
    terminal.close();
  }

  const existing = await database.query(
    `SELECT users.id FROM crm_users users
     JOIN crm_roles roles ON roles.id = users.role_id
     WHERE LOWER(users.email) = LOWER($1) AND roles.role_key = 'admin'`,
    [email],
  );
  if (!existing.rowCount) throw new Error('No Administrator account with that email was found. Check the email and try again.');

  const password = await askVisiblePassword('New Administrator password (8-64 characters; input will be visible): ');
  validatePassword(password);
  const hash = await bcrypt.hash(password, 12);
  await database.query(
    'UPDATE crm_users SET password_hash = $1, token_version = token_version + 1, updated_at = NOW() WHERE id = $2',
    [hash, existing.rows[0].id],
  );
  console.log('Administrator password updated. Sign in with the new password.');
}

main().catch((error) => {
  console.error('Administrator password reset failed:', error.message);
  process.exitCode = 1;
}).finally(() => database.end());
