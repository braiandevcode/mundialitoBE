import * as Joi from 'joi';

export const envValidationSchema = Joi.object({
  NODE_ENV: Joi.string()
    .valid('development', 'production', 'test')
    .default('development'),

  PORT: Joi.number()
    .port()
    .default(3000),

  DB_HOST: Joi.string()
    .required()
    .messages({ 'any.required': 'DB_HOST es requerida' }),

  DB_PORT: Joi.number()
    .port()
    .default(3306),

  DB_USER: Joi.string()
    .required()
    .messages({ 'any.required': 'DB_USER es requerida' }),

  DB_PASS: Joi.string()
    .allow('')
    .required()
    .messages({ 'any.required': 'DB_PASS es requerida' }),

  DB_NAME: Joi.string()
    .required()
    .messages({ 'any.required': 'DB_NAME es requerida' }),

  FIREBASE_PROJECT_ID: Joi.string()
    .required()
    .messages({ 'any.required': 'FIREBASE_PROJECT_ID es requerida' }),

  FIREBASE_CLIENT_EMAIL: Joi.string()
    .email()
    .required()
    .messages({
      'any.required': 'FIREBASE_CLIENT_EMAIL es requerida',
      'string.email': 'FIREBASE_CLIENT_EMAIL debe ser un email válido',
    }),

  FIREBASE_PRIVATE_KEY: Joi.string()
    .required()
    .messages({ 'any.required': 'FIREBASE_PRIVATE_KEY es requerida' }),

  THROTTLE_TTL: Joi.number()
    .integer()
    .min(1000)
    .default(60000),

  THROTTLE_LIMIT: Joi.number()
    .integer()
    .min(1)
    .default(30),

  CORS_ORIGIN: Joi.string()
    .uri({ scheme: ['http', 'https'] })
    .default('http://localhost:5173'),

  ADMIN_UID: Joi.string()
    .optional()
    .default(''),
});
