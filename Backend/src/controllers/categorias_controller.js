const connection = require('../bd/connections');

/**
 * OBTENER TODAS LAS CATEGORÍAS
 * Devuelve la lista (flores, ramos, plantas, etc.)
 */
const getCategorias = (req, res) => {

  const sql = 'SELECT * FROM categorias where estado_activo = 1 ORDER BY id';

  connection.query(sql, (err, results) => { 
    if (err) {
      return res.status(500).json({ error: err.message });
    }

 // devuelve todas las categorías
    res.json(results);
  });
};


/**
 * CREAR UNA NUEVA CATEGORÍA
 * Inserta una categoría en la base de datos
 */
const createCategoria = (req, res) => {

  const { nombre, estado_activo } = req.body;

 // validación
  if (!nombre) {
    return res.status(400).json({
 mensaje: 'El nombre es obligatorio'
    });
  }

  // El panel admin envía estado_activo. Si no llega, se usa 1 (activa),
  // que es el valor por defecto de la columna: mandar NULL la dejaría
  // oculta en el listado, porque getCategorias filtra por estado_activo = 1.
  const activa = estado_activo === undefined || estado_activo === null ? 1 : (estado_activo ? 1 : 0);
  const sql = 'INSERT INTO categorias (nombre, estado_activo) VALUES (?, ?)';

  connection.query(sql, [nombre, activa], (err) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

 // confirmación
 res.json({ mensaje: 'Categoría creada' });
  });
};


/**
 * DESACTIVAR CATEGORÍA (SOFT DELETE)
 *
 * No se borra en seco: productos.categoria_id tiene clave foránea hacia
 * categorias, así que un DELETE real soltaría los productos (ON DELETE SET NULL).
 * Desactivarla mantiene los datos y la deja disponible otra vez.
 */
const deleteCategoria = (req, res) => {

  const { id } = req.params;

  const sql = 'UPDATE categorias SET estado_activo = 0 WHERE id = ?';

  connection.query(sql, [id], (err, result) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({
 mensaje: 'Categoría no existe'
      });
    }

 res.json({ mensaje: 'Categoría desactivada' });
  });
};

module.exports = {
  getCategorias,
  createCategoria,
  deleteCategoria
};
