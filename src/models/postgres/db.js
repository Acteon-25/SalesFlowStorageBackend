import { Pool } from 'pg';
import { POSTGRES_DB_HOST, POSTGRES_DB_USER, POSTGRES_DB_PORT, POSTGRES_DB_NAME, POSTGRES_DB_PASSWORD } from '../../config.js';

export const pool = new Pool({
  host: POSTGRES_DB_HOST,
  user: POSTGRES_DB_USER,
  port: POSTGRES_DB_PORT,
  database: POSTGRES_DB_NAME,
  password: POSTGRES_DB_PASSWORD,
  ssl: { rejectUnauthorized: false },
  max: 5,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 60000
});
