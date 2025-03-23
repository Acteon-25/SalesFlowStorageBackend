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

export class ItemModel {
  static async getAll({ categoria }) {
    if (categoria) {
      const lowerCaseCategoria = categoria.toLowerCase()
      const [categorias] = await connection.query(`
        SELECT categoria_id,nombre_categoria 
        FROM categoria 
        WHERE LOWER(nombre_categoria) = ?;`,
        [lowerCaseCategoria])
      if (categorias.length === 0) {
        return []
      }
      const [{ categoria_id }] = categorias
      const [itemsWithCategory] = await connection.query(`
        SELECT BIN_TO_UUID(p.producto_id) id, p.nombre_producto, p.descripcion , p.precio
        FROM producto p
        JOIN producto_categorias pc ON p.producto_id = pc.producto_id
        WHERE pc.categoria_id = ?;`,
        [categoria_id])
      return itemsWithCategory
    }
    const [items] = await connection.query("SELECT BIN_TO_UUID(producto_id) id,nombre_producto,descripcion,precio FROM producto;")
    return items
  }

  static async getById({ id }) {
    const [items] = await connection.query(`
      SELECT BIN_TO_UUID(producto_id) id,nombre_producto,descripcion,precio
      FROM producto 
      WHERE BIN_TO_UUID(producto_id) = ?;`,
      [id])
    if (items.length === 0) {
      return null
    }
    return items
  }

  static async create({ input }) {
    const {
      categoria: categoriaInputs,
      nombre_producto,
      descripcion,
      precio
    } = input;

    const [uuidResult] = await connection.query("SELECT UUID() uuid;");
    const [{ uuid }] = uuidResult;

    try {
      await connection.query(`
            INSERT INTO producto (producto_id, nombre_producto, descripcion, precio)
            VALUES (UUID_TO_BIN("${uuid}"),?,?,?);`,
        [nombre_producto, descripcion, precio]
      );

      for (const categoriaInput of categoriaInputs) {
        let [categoriaResult] = await connection.query(`
          SELECT categoria_id FROM categoria WHERE nombre_categoria = ?;`,
          [categoriaInput]
        );

        let categoriaId;
        if (categoriaResult.length === 0) {
          const [insertResult] = await connection.query(`
              INSERT INTO categoria (nombre_categoria)
              VALUES (?);`,
            [categoriaInput]
          );
          categoriaId = insertResult.insertId;
        } else {
          categoriaId = categoriaResult[0].categoria_id;
        }

        await connection.query(`
          INSERT INTO producto_categorias (producto_id, categoria_id)
          VALUES (UUID_TO_BIN(?), ?);`,
          [uuid, categoriaId]
        );
      }
    } catch (e) {
      throw new Error("Error creating product and category relationship");
    }

    const [items] = await connection.query(`
        SELECT 
            p.nombre_producto, 
            p.descripcion,
            p.precio,
            BIN_TO_UUID(p.producto_id) AS id,
            c.nombre_categoria
        FROM 
            producto p
        LEFT JOIN 
            producto_categorias pc ON p.producto_id = pc.producto_id
        LEFT JOIN 
            categoria c ON pc.categoria_id = c.categoria_id
        WHERE 
            p.producto_id = UUID_TO_BIN(?);`,
      [uuid]
    );

    return items[0];
  }

  static async delete({ id }) {
    try {
      await connection.beginTransaction();

      await connection.query(`
            DELETE FROM producto_categorias 
            WHERE producto_id = UUID_TO_BIN(?);`,
        [id]
      );

      const [items] = await connection.query(`
            DELETE FROM producto 
            WHERE producto_id = UUID_TO_BIN(?);`,
        [id]
      );

      if (items.affectedRows === 0) {
        await connection.rollback();
        return { status: 404, message: "No se encontró el producto" };
      }

      await connection.commit();
      return true;
    } catch (error) {
      await connection.rollback();
      throw new Error("Error deleting product and its category relationships");
    }
  }

  static async update({ id, input }) {
    const {
      nombre_producto,
      descripcion,
      precio,
      categoria: categoriaInputs
    } = input;
    try {
      await connection.query(`
            UPDATE producto 
            SET nombre_producto = ?, descripcion = ?, precio = ?
            WHERE producto_id = UUID_TO_BIN(?);`,
        [nombre_producto, descripcion, precio, id]
      );

      await connection.query(`
            DELETE FROM producto_categorias 
            WHERE producto_id = UUID_TO_BIN(?);`,
        [id]
      );

      for (const categoriaInput of categoriaInputs) {
        const [categoriaResult] = await connection.query(`
                SELECT categoria_id FROM categoria WHERE nombre_categoria = ?;`,
          [categoriaInput]
        );
        if (categoriaResult.length > 0) {
          const categoriaId = categoriaResult[0].categoria_id;
          await connection.query(`
                    INSERT INTO producto_categorias (producto_id, categoria_id)
                    VALUES (UUID_TO_BIN(?), ?);`,
            [id, categoriaId]
          );
        }
      }

      const [items] = await connection.query(`
          SELECT 
              BIN_TO_UUID(p.producto_id) id,
              p.nombre_producto, 
              p.descripcion,
              p.precio,
              c.nombre_categoria
          FROM 
              producto p
          LEFT JOIN 
              producto_categorias pc ON p.producto_id = pc.producto_id
          LEFT JOIN 
              categoria c ON pc.categoria_id = c.categoria_id
          WHERE 
              p.producto_id = UUID_TO_BIN(?);`,
        [id]
      );

      return items[0];
    } catch (e) {
      throw new Error("Error updating item");
    }
  }
}