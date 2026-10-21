require('dotenv').config();
const Joi = require('joi');

if (process.env.DATABASE_URL?.includes('CHANGE_ME')) {
  console.error('Invalid server configuration: DATABASE_URL still uses the CHANGE_ME example password. Replace it with your actual PostgreSQL password in backend/.env.');
  process.exit(1);
}
if (process.env.JWT_SECRET?.includes('CHANGE_ME')) {
  console.error('Invalid server configuration: replace the JWT_SECRET example with a random secret in backend/.env.');
  process.exit(1);
}

const schema = Joi.object({
  NODE_ENV: Joi.string().valid('development', 'test', 'production').default('development'),
  PORT: Joi.number().integer().positive().default(5000),
  DATABASE_URL: Joi.string().custom((value, helpers) => {
    try {
      const url = new URL(value);
      const validProtocol = ['postgres:', 'postgresql:'].includes(url.protocol);
      const databaseName = decodeURIComponent(url.pathname.replace(/^\//, ''));
      if (validProtocol && url.hostname && databaseName) return value;
    } catch {
      // Report a single actionable configuration error below.
    }
    return helpers.error('string.postgresUri');
  }).messages({
    'string.postgresUri': '"DATABASE_URL" must be a PostgreSQL URL with a host and database name (for example, postgresql://user:password@localhost:5432/velvorax_crm)',
  }).required(),
  JWT_SECRET: Joi.string().min(32).required().messages({
    'string.min': 'JWT_SECRET must contain at least 32 characters. Set a random secret in backend/.env.',
    'any.required': 'JWT_SECRET is required. Set a random secret in backend/.env.',
  }),
  JWT_EXPIRES_IN: Joi.string().pattern(/^[1-9]\d*[smhd]$/).default('8h'),
  SMTP_HOST: Joi.string().allow('').default(''),
  SMTP_PORT: Joi.number().integer().positive().default(587),
  SMTP_SECURE: Joi.boolean().default(false),
  SMTP_USER: Joi.string().allow('').default(''),
  SMTP_PASSWORD: Joi.string().allow('').default(''),
  SMTP_FROM: Joi.string().allow('').default(''),
  CLIENT_ORIGIN: Joi.string().uri().default('http://localhost:5173'),
}).unknown(true);

const { error, value } = schema.validate(process.env, { abortEarly: false, convert: true });
if (error) {
  console.error('Invalid server configuration:', error.details.map((detail) => detail.message));
  if (!process.env.DATABASE_URL) {
    console.error('Setup: from the backend folder, copy .env.example to .env, then replace CHANGE_ME in DATABASE_URL with your PostgreSQL password. Do not use the example password as a real credential.');
  }
  process.exit(1);
}

module.exports = { env: value };
