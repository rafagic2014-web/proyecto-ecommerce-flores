// IMPORTAR CONEXIÓN BD
const connection = require('../bd/connections');

/**
 * ======================================================
 * OBTENER PRODUCTOS (PÚBLICO)
 * ======================================================
 */
const getProductos = (req, res) => {

  const sql =`
    SELECT * FROM productos
    WHERE estado_activo = true
    ORDER BY id
  `;

  connection.query(sql, (err, results) => {

    if (err) {
      return res.status(500).json({ error: err.message });
    }

    res.json(results);
  });
};


/**
 * ======================================================
 * CREAR PRODUCTO
 * ======================================================
 */
const createProducto = (req, res) => {

  const { nombre, descripcion, precio, stock, imagen, categoria_id } = req.body;

  if (!nombre || !precio) {
    return res.status(400).json({
 mensaje: 'Nombre y precio son obligatorios'
    });
  }

  const sql =`
    INSERT INTO productos (nombre, descripcion, precio, stock, imagen, categoria_id)
    VALUES (?, ?, ?, ?, ?, ?)
  `;

  connection.query(sql,
    [nombre, descripcion, precio, stock, imagen, categoria_id],
    (err) => {

      if (err) {
        return res.status(500).json({ error: err.message });
      }

 res.json({ mensaje: 'Producto creado' });
    }
  );
};


/**
 * ======================================================
 * FILTRAR POR CATEGORÍA
 * ======================================================
 */
const getProductosPorCategoria = (req, res) => {

  const { categoria_id } = req.params;

  const sql =`
    SELECT * FROM productos
    WHERE categoria_id = ? AND estado_activo = true
    ORDER BY id
  `;

  connection.query(sql, [categoria_id], (err, results) => {

    if (err) {
      return res.status(500).json({ error: err.message });
    }

    res.json(results);
  });
};


/**
 * ======================================================
 * ACTUALIZAR PRODUCTO
 * ======================================================
 */


const updateProducto = (req, res) => {

  const { id } = req.params;
  const { nombre, descripcion, precio, stock, imagen } = req.body;

  // El formulario manda '' cuando la categoría es "Sin categoría".
  // MySQL en modo estricto rechaza '' en una columna INT, así que
  // se traduce a NULL antes de arrivear.
  const categoriaId =
    req.body.categoria_id === '' || req.body.categoria_id === undefined
      ? null
      : req.body.categoria_id;

  const sql =`
    UPDATE productos SET
      nombre = ?,
      descripcion = ?,
      precio = ?,
      stock = ?,
      imagen = ?,
      categoria_id = ?
    WHERE id = ?
  `;

  connection.query(
    sql,
    [nombre, descripcion, precio, stock, imagen, categoriaId, id],
    (err, result) => {

      if (err) {
        return res.status(500).json({ error: err.message });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({
 mensaje: "Producto no existe"
        });
      }

 res.json({ mensaje: "Producto actualizado" });
    }
  );
};

/**
 * ======================================================
 * DESCONTAR STOCK (CLAVE PARA COMPRA)
 * ======================================================
 *
 * La cantidad se valida antes de tocar la base porque el filtro
 * `stock >= ?` no protege: con una cantidad negativa la condición
 * siempre se cumple y `stock - (-50)` AUMENTABA el inventario.
 */
const descontarStock = (req, res) => {

  const id = Number(req.body.id);
  const cantidad = Number(req.body.cantidad);

  if (!Number.isInteger(id) || id < 1) {
 return res.status(400).json({ mensaje: 'Producto inválido' });
  }

  if (!Number.isInteger(cantidad) || cantidad < 1) {
 return res.status(400).json({ mensaje: 'Cantidad inválida' });
  }

  const sql =`
    UPDATE productos
    SET stock = stock - ?
    WHERE id = ? AND stock >= ? AND estado_activo = true
  `;

  connection.query(sql, [cantidad, id, cantidad], (err, result) => {

    if (err) {
      return res.status(500).json({ error: err.message });
    }

    if (result.affectedRows === 0) {
      return res.status(400).json({
 mensaje: 'Stock insuficiente o producto no disponible'
      });
    }

 res.json({ mensaje: 'Stock actualizado' });
  });
};



/**
 * ======================================================
 * SOFT DELETE
 * ======================================================
 */
const deleteProducto = (req, res) => {

  const { id } = req.params;

  const sql =`
    UPDATE productos
    SET estado_activo = false
    WHERE id = ?
  `;

  connection.query(sql, [id], (err, result) => {

    if (err) {
      return res.status(500).json({ error: err.message });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({
 mensaje: 'Producto no existe'
      });
    }

 res.json({ mensaje: 'Producto desactivado' });
  });
};


/**
 * ======================================================
 * REACTIVAR PRODUCTO
 * ======================================================
 */
const activarProducto = (req, res) => {

  const { id } = req.params;

  const sql =`
    UPDATE productos
    SET estado_activo = true
    WHERE id = ?
  `;

  connection.query(sql, [id], (err, result) => {

    if (err) {
      return res.status(500).json({ error: err.message });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({
 mensaje: 'Producto no existe'
      });
    }

 res.json({ mensaje: 'Producto reactivado' });
  });
};


/**
 * ======================================================
 * ADMIN → TODOS LOS PRODUCTOS
 * ======================================================
 */
const getTodosProductos = (req, res) => {

  const sql = `SELECT * FROM productos ORDER BY id`;

  connection.query(sql, (err, results) => {

    if (err) {
      return res.status(500).json({ error: err.message });
    }

    res.json(results);
  });
};


/**
 * ======================================================
 * EXPORTAR (AQUÍ ESTABA EL ERROR)
 * ======================================================
 */
module.exports = {
  getProductos,
  createProducto,
  getProductosPorCategoria,
  updateProducto,
  deleteProducto,
  activarProducto,
  getTodosProductos,
 descontarStock // ESTA LÍNEA ERA LA QUE FALTABA
};
