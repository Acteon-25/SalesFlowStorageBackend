import mysql from "mysql2/promise.js"
import { DB_HOST, DB_NAME, DB_PASSWORD, DB_PORT, DB_USER } from "../../config.js"

const defaultConfig = {
  host: DB_HOST,
  user: DB_USER,
  port: DB_PORT,
  password: DB_PASSWORD,
  database: DB_NAME
}

const connection = await mysql.createConnection(defaultConfig)

export class SaleModel {
  static async getAll({ startDateModel, endDateModel }) {
    if (startDateModel && endDateModel) {
      const [sales] = await connection.query(
        `SELECT 
            u.username, 
            p.nombre_producto, 
            v.cantidad, 
            v.total, 
            v.fecha_venta, 
            BIN_TO_UUID(v.venta_id) AS venta_id
         FROM venta v
         JOIN usuario u ON v.usuario_id = u.usuario_id
         JOIN producto p ON v.producto_id = p.producto_id
         WHERE v.fecha_venta >= ? 
           AND v.fecha_venta < DATE_ADD(?, INTERVAL 1 SECOND);`,
        [`${startDateModel}`, `${endDateModel}`]
      );

      return sales
    }
    const [sales] = await connection.query(`
      SELECT u.username, p.nombre_producto, v.cantidad, v.total, v.fecha_venta,BIN_TO_UUID(v.venta_id) venta_id
      FROM venta v
      JOIN usuario u ON v.usuario_id = u.usuario_id
      JOIN producto p ON v.producto_id = p.producto_id`
    )
    return sales
  }

  static async getById({ id }) {
    const [sales] = await connection.query(`
      SELECT BIN_TO_UUID(u.usuario_id) userId,u.username, p.nombre_producto, v.cantidad, v.total, v.fecha_venta
      FROM venta v
      JOIN usuario u ON v.usuario_id = u.usuario_id
      JOIN producto p ON v.producto_id = p.producto_id
      WHERE BIN_TO_UUID(v.venta_id) = ?;`,
      [id])
    if (sales.length === 0) {
      return null
    }
    return sales
  }

  static async create({ input, id }) {
    const {
      producto_id,
      cantidad,
    } = input;
    const [uuidResult] = await connection.query("SELECT UUID() uuid;");
    const [{ uuid }] = uuidResult;

    try {
      const [producto] = await connection.query(
        `SELECT precio FROM producto WHERE producto_id = UUID_TO_BIN(?)`,
        [producto_id]
      );
      if (producto.length === 0) {
        return [];
      }
      const precio = producto[0].precio;
      const total = cantidad * precio;

      const [res] = await connection.query(`
        INSERT INTO venta (venta_id, usuario_id, producto_id, cantidad, total)
        VALUES (UUID_TO_BIN("${uuid}"),UUID_TO_BIN(?),UUID_TO_BIN(?),?,?);`,
        [id, producto_id, cantidad, total]
      );
      return res
    } catch (e) {
      throw new Error("Error creating sale");
    }
  }

  static async delete({ id }) {
    const [sales] = await connection.query(
      `SELECT venta_id FROM venta WHERE BIN_TO_UUID(venta_id) = ?;`,
      [id]
    )

    if (sales.length === 0) {
      return null
    }

    await connection.query(
      `DELETE FROM venta WHERE venta_id = UUID_TO_BIN(?);`,
      [id]
    )

    return { message: "Venta eliminada correctamente" }
  }
}