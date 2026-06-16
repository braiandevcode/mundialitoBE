import { registerAs } from '@nestjs/config';

export default registerAs('env', () => ({
  nodeEnv:
    process.env.NODE_ENV || (process.env.RAILWAY_ENVIRONMENT ? 'production' : 'development'),
  port: parseInt(process.env.PORT || '3000', 10),

  db: {
    host: process.env.MYSQLHOST || 'localhost',
    port: parseInt(process.env.MYSQLPORT || '3306', 10),
    user: process.env.MYSQLUSER || 'root',
    pass: process.env.MYSQLPASSWORD || '',
    name: process.env.MYSQLDATABASE || 'mundialito_app',
  },

  firebase: {
    projectId: process.env.FIREBASE_PROJECT_ID || '',
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL || '',
    privateKey: (process.env.FIREBASE_PRIVATE_KEY || '').replace(/\\n/g, '\n'),
  },

  throttle: {
    ttl: parseInt(process.env.THROTTLE_TTL || '60000', 10),
    limit: parseInt(process.env.THROTTLE_LIMIT || '30', 10),
  },

  corsOrigin: process.env.CORS_ORIGIN || 'https://mundialito-fe.vercel.app',

  adminUid: process.env.ADMIN_UID || '',
}));
