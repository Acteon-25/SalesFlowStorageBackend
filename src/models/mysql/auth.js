/*import mysql from "mysql2/promise.js" // para el uso  paquete "mysql2"
import { MYSQL_DB_HOST, MYSQL_DB_NAME, MYSQL_DB_PASSWORD, MYSQL_DB_PORT, MYSQL_DB_USER, SALT_ROUNDS } from '../../config.js';
import bcrypt from "bcrypt";

const defaultConfig = {
  host: MYSQL_DB_HOST,
  user: MYSQL_DB_USER,
  port: MYSQL_DB_PORT,
  password: MYSQL_DB_PASSWORD,
  database: MYSQL_DB_NAME,
  waitForConnections: true,
  connectionLimit: 5,
  queueLimit: 0,
  connectTimeout: 60000,
  keepAliveInitialDelay: 10000,
}

const connection = await mysql.createPool(defaultConfig)

export class AuthModel {

  static async register({ input }) {
    const {
      username,
      email,
      password
    } = input;
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    try {
      const [existingEmail] = await connection.query(`
      SELECT email FROM usuario WHERE email = ?;
    `, [email]);

      if (existingEmail.length > 0) {
        return { success: false, message: "Error email already registered", status: 400 };
      }

      const [uuidResult] = await connection.query("SELECT UUID() uuid;");
      const [{ uuid }] = uuidResult;


      await connection.query(`
        INSERT INTO usuario (usuario_id, username, email, password)
        VALUES (UUID_TO_BIN(?), ?, ?, ?);`,
        [uuid, username, email, hashedPassword]
      );


      const [auths] = await connection.query(`
        SELECT 
            u.username, 
            u.email,
            u.password,
            BIN_TO_UUID(u.usuario_id) id
        FROM 
            usuario u
        WHERE 
            u.usuario_id = UUID_TO_BIN(?);`,
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
      const [userResult] = await connection.query(`
        SELECT BIN_TO_UUID(usuario_id) id, username, email, password FROM usuario WHERE email = ?;
      `, [email]);
      if (!userResult[0]) {
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
}*/