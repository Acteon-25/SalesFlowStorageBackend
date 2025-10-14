import { pool } from './db.js';

export class ItemModel {
  static async getAll({ categoria }) {
    if (categoria) {
      const lowerCaseCategoria = categoria.toLowerCase();
      const { rows: categorias } = await pool.query(
        'SELECT categoria_id, nombre_categoria FROM categoria WHERE LOWER(nombre_categoria) = $1;',
        [lowerCaseCategoria]
      );
      if (categorias.length === 0) {
        return [];
      }
      const { categoria_id } = categorias[0];
      const { rows: itemsWithCategory } = await pool.query(
        'SELECT p.producto_id as id, p.nombre_producto, p.descripcion, p.precio FROM producto p JOIN producto_categorias pc ON p.producto_id = pc.producto_id WHERE pc.categoria_id = $1;',
        [categoria_id]
      );
      return itemsWithCategory;
    }
    const { rows: items } = await pool.query('SELECT producto_id as id, nombre_producto, descripcion, precio FROM producto;');
    return items;
  }

  static async getById({ id }) {
    const { rows: items } = await pool.query(
      'SELECT producto_id as id, nombre_producto, descripcion, precio FROM producto WHERE producto_id = $1;',
      [id]
    );
    if (items.length === 0) {
      return null;
    }
    return items;
  }

  static async create({ input }) {
    const {
      categoria: categoriaInputs,
      nombre_producto,
      descripcion,
      precio
    } = input;

    const { rows: uuidResult } = await pool.query('SELECT gen_random_uuid() as uuid;');
    const { uuid } = uuidResult[0];

    try {
      await pool.query(
        'INSERT INTO producto (producto_id, nombre_producto, descripcion, precio) VALUES ($1, $2, $3, $4);',
        [uuid, nombre_producto, descripcion, precio]
      );

      for (const categoriaInput of categoriaInputs) {
        const { rows: categoriaResult } = await pool.query(
          'SELECT categoria_id FROM categoria WHERE nombre_categoria = $1;',
          [categoriaInput]
        );

        let categoriaId;
        if (categoriaResult.length === 0) {
          const { rows: insertResult } = await pool.query(
            'INSERT INTO categoria (nombre_categoria) VALUES ($1) RETURNING categoria_id;',
            [categoriaInput]
          );
          categoriaId = insertResult[0].categoria_id;
        } else {
          categoriaId = categoriaResult[0].categoria_id;
        }

        await pool.query(
          'INSERT INTO producto_categorias (producto_id, categoria_id) VALUES ($1, $2);',
          [uuid, categoriaId]
        );
      }
    } catch (e) {
      throw new Error("Error creating product and category relationship");
    }

    const { rows: items } = await pool.query(
      'SELECT p.nombre_producto, p.descripcion, p.precio, p.producto_id AS id, c.nombre_categoria FROM producto p LEFT JOIN producto_categorias pc ON p.producto_id = pc.producto_id LEFT JOIN categoria c ON pc.categoria_id = c.categoria_id WHERE p.producto_id = $1;',
      [uuid]
    );

    return items[0];
  }

  static async delete({ id }) {
    try {
      await pool.query('BEGIN;');

      await pool.query(
        'DELETE FROM producto_categorias WHERE producto_id = $1;',
        [id]
      );

      const { rows: items } = await pool.query(
        'DELETE FROM producto WHERE producto_id = $1 RETURNING *;',
        [id]
      );

      if (items.length === 0) {
        await pool.query('ROLLBACK;');
        return { status: 404, message: "No se encontró el producto" };
      }

      await pool.query('COMMIT;');
      return true;
    } catch (error) {
      await pool.query('ROLLBACK;');
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
      await pool.query(
        'UPDATE producto SET nombre_producto = $1, descripcion = $2, precio = $3 WHERE producto_id = $4;',
        [nombre_producto, descripcion, precio, id]
      );

      await pool.query(
        'DELETE FROM producto_categorias WHERE producto_id = $1;',
        [id]
      );

      for (const categoriaInput of categoriaInputs) {
        const { rows: categoriaResult } = await pool.query(
          'SELECT categoria_id FROM categoria WHERE nombre_categoria = $1;',
          [categoriaInput]
        );
        if (categoriaResult.length > 0) {
          const categoriaId = categoriaResult[0].categoria_id;
          await pool.query(
            'INSERT INTO producto_categorias (producto_id, categoria_id) VALUES ($1, $2);',
            [id, categoriaId]
          );
        }
      }

      const { rows: items } = await pool.query(
        'SELECT p.producto_id as id, p.nombre_producto, p.descripcion, p.precio, c.nombre_categoria FROM producto p LEFT JOIN producto_categorias pc ON p.producto_id = pc.producto_id LEFT JOIN categoria c ON pc.categoria_id = c.categoria_id WHERE p.producto_id = $1;',
        [id]
      );

      return items[0];
    } catch (e) {
      throw new Error("Error updating item");
    }
  }
}
