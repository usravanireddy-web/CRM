const readline = require('node:readline/promises');
const { stdin, stdout } = require('node:process');

async function askVisiblePassword(label) {
  const terminal = readline.createInterface({ input: stdin, output: stdout });
  try {
    return await terminal.question(label);
  } finally {
    terminal.close();
  }
}

function validatePassword(password) {
  if (password.length < 8 || password.length > 64) {
    throw new Error('Password must be between 8 and 64 characters.');
  }
  if (Buffer.byteLength(password, 'utf8') > 72) {
    throw new Error('Password is too long when encoded. Use at most 72 UTF-8 bytes.');
  }
}

module.exports = { askVisiblePassword, validatePassword };
