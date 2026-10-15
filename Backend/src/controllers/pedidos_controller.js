const connection = require('../bd/connections');
const { TASAS, tasaDe, calcularTotales } = require('../lib/moneda');

/**
 * Error de negocio: algo que el usuario puede corregir
 * (no queda stock, el producto no existe, el carrito está vacío).
 */
class ErrorNegocio extends Error {
  constructor(mensaje) {
    super(mensaje);
    this.name = 'ErrorNegocio';
  }
}

/** Normaliza y valida una línea del carrito. */
const leerLinea = (item) => {
  const id = Number(item?.id);
  const cantidad = Number(item?.cantidad);

  if (!Number.isInteger(id) || id < 1) {
    throw new ErrorNegocio('El pedido tiene un producto inválido.');
  }

  if (!Number.isInteger(cantidad) || cantidad < 1) {
    throw new ErrorNegocio('La cantidad de cada producto debe ser un número entero mayor que 0.');
  }

  return { id, cantidad };
};

const crearPedido = async (req, res) => {
  const usuarioId = Number(req.user?.id);
  const cliente = req.body?.cliente || {};
  const items = Array.isArray(req.body?.items) ? req.body.items : [];

  if (!usuarioId) {
    return res.status(401).json({ mensaje: 'Sesión no válida' });
  }

  if (items.length === 0) {
    return res.status(400).json({ mensaje: 'El pedido está vacío' });
  }

  const moneda = TASAS[cliente.moneda] ? cliente.moneda : 'USD';
  
  // Obtenemos el pool de promesas de forma dinámica en tiempo de ejecución
  const pool = connection.promise();
  let conn;

  try {
    const lineas = items.map(leerLinea);
    const tasa = tasaDe(moneda);

    conn = await pool.getConnection();
    await conn.beginTransaction();

    const productos = [];

    for (const linea of lineas) {
      const [rows] = await conn.query(
        `SELECT id, nombre, precio, stock, estado_activo
           FROM productos
          WHERE id = ?
          FOR UPDATE`,
        [linea.id]
      );

      if (rows.length === 0) {
        throw new ErrorNegocio(`El producto ${linea.id} ya no existe`);
      }

      const p = rows[0];

      if (!p.estado_activo) {
        throw new ErrorNegocio(`"${p.nombre}" ya no está disponible`);
      }

      if (Number(p.stock) < linea.cantidad) {
        throw new ErrorNegocio(
          `Stock insuficiente de "${p.nombre}": quedan ${p.stock} y pediste ${linea.cantidad}`
        );
      }

      productos.push({ ...p, cantidad: linea.cantidad });
    }

    const { subtotal, envio, total } = calcularTotales(productos, moneda);

    const [pedido] = await conn.query(
      `INSERT INTO pedidos
         (usuario_id, total, cedula, nombre_cliente, direccion, pais, moneda)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        usuarioId,
        total,
        cliente.cedula || null,
        cliente.nombre || null,
        cliente.direccion || null,
        cliente.pais || null,
        moneda,
      ]
    );

    for (const p of productos) {
      await conn.query(
        `INSERT INTO pedido_detalle
           (pedido_id, producto_id, nombre, precio, cantidad, subtotal)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [
          pedido.insertId,
          p.id,
          p.nombre,
          Number(p.precio),
          p.cantidad,
          Number((Number(p.precio) * tasa * p.cantidad).toFixed(2)),
        ]
      );
    }

    for (const p of productos) {
      const [r] = await conn.query(
        `UPDATE productos
            SET stock = stock - ?
          WHERE id = ? AND stock >= ?`,
        [p.cantidad, p.id, p.cantidad]
      );

      if (r.affectedRows === 0) {
        throw new ErrorNegocio(`Stock insuficiente de "${p.nombre}"`);
      }
    }

    await conn.commit();

    res.status(201).json({
      mensaje: 'Pedido realizado',
      pedido: {
        id: pedido.insertId,
        total,
        subtotal,
        envio,
        moneda,
        articulos: productos.reduce((acc, p) => acc + p.cantidad, 0),
        items: productos.map((p) => ({
          id: p.id,
          nombre: p.nombre,
          cantidad: p.cantidad,
          precio: Number(p.precio),
        })),
      },
    });
  } catch (err) {
    if (conn) {
      try {
        await conn.rollback();
      } catch (rollbackErr) {
        console.error('ERROR ROLLBACK:', rollbackErr);
      }
    }

    if (err instanceof ErrorNegocio) {
      return res.status(400).json({ mensaje: err.message });
    }

    console.error('ERROR PEDIDO:', err);
    return res.status(500).json({
      mensaje: 'No se pudo registrar el pedido. No se descontó ningún producto.',
    });
  } finally {
    if (conn) conn.release();
  }
};

const obtenerPedidos = async (req, res) => {
  // Obtenemos el pool de promesas de forma dinámica aquí también
  const pool = connection.promise();

  try {
    const [pedidos] = await pool.query(
      `SELECT p.id,
              p.total,
              p.fecha,
              p.cedula,
              p.nombre_cliente,
              p.direccion,
              p.pais,
              p.moneda,
              u.nombre AS usuario_nombre,
              u.email    AS usuario_email
         FROM pedidos p
         LEFT JOIN usuarios u ON u.id = p.usuario_id
     ORDER BY p.fecha DESC, p.id DESC`
    );

    if (pedidos.length === 0) {
      return res.json([]);
    }

    const [detalle] = await pool.query(
      `SELECT pedido_id, producto_id, nombre, precio, cantidad, subtotal
         FROM pedido_detalle
        WHERE pedido_id IN (?)
     ORDER BY id`,
      [pedidos.map((p) => p.id)]
    );

    const porPedido = new Map();

    for (const linea of detalle) {
      if (!porPedido.has(linea.pedido_id)) porPedido.set(linea.pedido_id, []);

      porPedido.get(linea.pedido_id).push({
        producto_id: linea.producto_id,
        nombre: linea.nombre,
        precio: Number(linea.precio),
        cantidad: linea.cantidad,
        subtotal: Number(linea.subtotal),
      });
    }

    return res.json(
      pedidos.map((p) => {
        const items = porPedido.get(p.id) || [];

        return {
          id: p.id,
          total: Number(p.total),
          fecha: p.fecha,
          cedula: p.cedula,
          nombre_cliente: p.nombre_cliente,
          direccion: p.direccion,
          pais: p.pais,
          moneda: p.moneda || 'USD',
          usuario_nombre: p.usuario_nombre,
          usuario_email: p.usuario_email,
          articulos: items.reduce((acc, i) => acc + i.cantidad, 0),
          detalle: items,
        };
      })
    );
  } catch (err) {
    console.error('ERROR LISTAR PEDIDOS:', err);
    return res.status(500).json({ mensaje: 'No se pudieron cargar los pedidos.' });
  }
};

module.exports = { crearPedido, obtenerPedidos };