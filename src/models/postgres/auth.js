import { Pool } from 'pg';
import { POSTGRES_DB_HOST, POSTGRES_DB_NAME, POSTGRES_DB_PASSWORD, POSTGRES_DB_PORT, POSTGRES_DB_USER, SALT_ROUNDS } from '../../config.js';
import bcrypt from 'bcrypt';

const defaultConfig = {
  host: POSTGRES_DB_HOST,
  user: POSTGRES_DB_USER,
  port: POSTGRES_DB_PORT,
  database: POSTGRES_DB_NAME,
  password: POSTGRES_DB_PASSWORD,
  ssl: { rejectUnauthorized: false },
  max: 5, // connectionLimit equivalent
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 60000,
};

const pool = new Pool(defaultConfig);

export class AuthModel {
  static async register({ input }) {
    const {
      username,
      email,
      password
    } = input;
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    try {
      const { rows: existingEmail } = await pool.query(
        'SELECT email FROM usuario WHERE email = $1;',
        [email]
      );

      if (existingEmail.length > 0) {
        return { success: false, message: "Error email already registered", status: 400 };
      }

      const { rows: uuidResult } = await pool.query('SELECT gen_random_uuid() as uuid;');
      const { uuid } = uuidResult[0];

      await pool.query(
        'INSERT INTO usuario (usuario_id, username, email, password) VALUES ($1, $2, $3, $4);',
        [uuid, username, email, hashedPassword]
      );

      const { rows: auths } = await pool.query(
        'SELECT u.username, u.email, u.password, u.usuario_id as id FROM usuario u WHERE u.usuario_id = $1;',
        [uuid]
      );

      return { success: true, data: auths[0], status: 201 };
    } catch (e) {
      return { success: false, message: "Error creating user", status: 500 };
    }
  }

  static async login({ input }) {
    const {
      email,
      password
    } = input;

    try {
      const { rows: userResult } = await pool.query(
        'SELECT usuario_id as id, username, email, password FROM usuario WHERE email = $1;',
        [email]
      );
      if (userResult.length === 0) {
        return { success: false, message: "El correo ingresado no está registrado", status: 404 };
      }
      const isMatch = await bcrypt.compare(password, userResult[0].password);
      if (!isMatch) {
        return { success: false, message: "La contraseña no es correcta", status: 401 };
      }
      return {
        id: userResult[0].id,
        username: userResult[0].username,
        email: userResult[0].email
      };
    } catch (e) {
      return { success: false, message: "authentication error", status: 500 };
    }
  }

  static async logout(res) {
    try {
      res.clearCookie("access_token", {
        httpOnly: true,
        secure: true,
        sameSite: "None",
        path: "/",
      });
      res.status(200).json({ message: "Logout successful" })
    } catch (e) {
      return res.status(500).json({ message: "Error logging out" })
    }
  }
}
