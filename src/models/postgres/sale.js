import { Pool } from 'pg';
import { POSTGRES_DB_HOST, POSTGRES_DB_NAME, POSTGRES_DB_PASSWORD, POSTGRES_DB_PORT, POSTGRES_DB_USER } from '../../config.js';

const defaultConfig = {
  host: POSTGRES_DB_HOST,
  user: POSTGRES_DB_USER,
  port: POSTGRES_DB_PORT,
  password: POSTGRES_DB_PASSWORD,
  database: POSTGRES_DB_NAME,
  ssl: { rejectUnauthorized: false },
  max: 5,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 60000,
};

const pool = new Pool(defaultConfig);

export class SaleModel {
  static async getAll({ startDateModel, endDateModel }) {
    if (startDateModel && endDateModel) {
      const { rows: sales } = await pool.query(
        'SELECT u.username, p.nombre_producto, v.cantidad, v.total, v.fecha_venta, v.venta_id FROM venta v JOIN usuario u ON v.usuario_id = u.usuario_id JOIN producto p ON v.producto_id = p.producto_id WHERE v.fecha_venta >= $1 AND v.fecha_venta < $2;',
        [startDateModel, endDateModel]
      );
      return sales;
    }
    const { rows: sales } = await pool.query(
      'SELECT u.username, p.nombre_producto, v.cantidad, v.total, v.fecha_venta, v.venta_id FROM venta v JOIN usuario u ON v.usuario_id = u.usuario_id JOIN producto p ON v.producto_id = p.producto_id;'
    );
    return sales;
  }

  static async getById({ id }) {
    const { rows: sales } = await pool.query(
      'SELECT u.usuario_id as userId, u.username, p.nombre_producto, v.cantidad, v.total, v.fecha_venta, v.venta_id as id FROM venta v JOIN usuario u ON v.usuario_id = u.usuario_id JOIN producto p ON v.producto_id = p.producto_id WHERE v.venta_id = $1;',
      [id]
    );
    if (sales.length === 0) {
      return null;
    }
    return sales[0]; // Devolvemos solo el primer elemento
  }

  static async create({ input, id }) {
    const {
      producto_id,
      cantidad,
    } = input;
    const { rows: uuidResult } = await pool.query('SELECT gen_random_uuid() as uuid;');
    const { uuid } = uuidResult[0];

    try {
      const { rows: producto } = await pool.query(
        'SELECT precio FROM producto WHERE producto_id = $1;',
        [producto_id]
      );
      if (producto.length === 0) {
        return [];
      }
      const precio = producto[0].precio;
      const total = cantidad * precio;

      await pool.query(
        'INSERT INTO venta (venta_id, usuario_id, producto_id, cantidad, total) VALUES ($1, $2, $3, $4, $5);',
        [uuid, id, producto_id, cantidad, total]
      );
      return { insertId: uuid };
    } catch (e) {
      throw new Error("Error creating sale");
    }
  }
  
  static async delete({ id }) {
    const client = await pool.connect();
    try {
      const { rows: sales } = await client.query(
        'SELECT venta_id FROM venta WHERE venta_id = $1;',
        [id]
      );

      if (sales.length === 0) {
        return null;
      }

      await client.query(
        'DELETE FROM venta WHERE venta_id = $1;',
        [id]
      );

      return { message: "Venta eliminada correctamente" };
    } catch (error) {
      throw new Error('Error al eliminar la venta: ' + error.message);
    } finally {
      client.release();
    }
  }
}
