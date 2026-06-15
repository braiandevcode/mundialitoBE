import * as Joi from 'joi';

export const envValidationSchema = Joi.object({
  NODE_ENV: Joi.string()
    .valid('development', 'production', 'test')
    .default('development'),

  PORT: Joi.number()
    .port()
    .default(3000),

  MYSQLHOST: Joi.string()
    .required()
    .messages({ 'any.required': 'MYSQLHOST es requerida' }),

  MYSQLPORT: Joi.number()
    .port()
    .default(3306),

  MYSQLUSER: Joi.string()
    .required()
    .messages({ 'any.required': 'MYSQLUSER es requerida' }),

  MYSQLPASSWORD: Joi.string()
    .allow('')
    .required()
    .messages({ 'any.required': 'MYSQLPASSWORD es requerida' }),

  MYSQLDATABASE: Joi.string()
    .required()
    .messages({ 'any.required': 'MYSQLDATABASE es requerida' }),

  FIREBASE_PROJECT_ID: Joi.string()
    .allow('')
    .default(''),

  FIREBASE_CLIENT_EMAIL: Joi.string()
    .allow('')
    .email()
    .messages({
      'string.email': 'FIREBASE_CLIENT_EMAIL debe ser un email válido',
    })
    .default(''),

  FIREBASE_PRIVATE_KEY: Joi.string()
    .allow('')
    .default(''),

  THROTTLE_TTL: Joi.number()
    .integer()
    .min(1000)
    .default(60000),

  THROTTLE_LIMIT: Joi.number()
    .integer()
    .min(1)
    .default(30),

  CORS_ORIGIN: Joi.string()
    .custom((value: string, helpers) => {
      const origins = value
        .split(',')
        .map((origin) => origin.trim())
        .filter(Boolean);

      for (const origin of origins) {
        const { error } = Joi.string()
          .uri({ scheme: ['http', 'https'] })
          .validate(origin);

        if (error) return helpers.error('string.uri');
      }

      return value;
    })
    .default('http://localhost:5173'),

  ADMIN_UID: Joi.string()
    .optional()
    .default(''),
});
