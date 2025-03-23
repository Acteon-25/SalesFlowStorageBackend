export const {
  DB_HOST,
  DB_USER,
  DB_PASSWORD,
  DB_NAME,
  DB_PORT,
  SECRET_KEY
} = process.env;

export const SALT_ROUNDS = parseInt(process.env.SALT_ROUNDS, 10);