import mysql from "mysql2/promise.js"
import { DB_HOST, DB_NAME, DB_PASSWORD, DB_PORT, DB_USER, SALT_ROUNDS } from "../../config.js"
import bcrypt from "bcrypt";

const defaultConfig = {
  host: DB_HOST,
  user: DB_USER,
  port: DB_PORT,
  password: DB_PASSWORD,
  database: DB_NAME
}

const connection = await mysql.createConnection(defaultConfig)

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
        return { success: false, message: "Error not found", status: 404 };
      }
      const isMatch = await bcrypt.compare(password, userResult[0].password);
      if (!isMatch) {
        return { success: false, message: "Incorrect password", status: 401 };
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