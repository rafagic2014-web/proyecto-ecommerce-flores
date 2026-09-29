const connection = require('../bd/connections');
const { TASAS, tasaDe, calcularTotales } = require('../lib/moneda');

// El pool es de callbacks, así que la conexión exclusiva de la
// transacción se pide por su interfaz con promesas.
const pool = connection.promise();

/**
 * Error de negocio: algo que el usuario puede corregir
 * (no queda stock, el producto no existe, el carrito está vacío).
 * Se traduce a un 400 legible en vez de un 500 con detalle de SQL.
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

/**
 * CREAR PEDIDO (TODO EN UNA TRANSACCIÓN)
 * Todo ocurre en una transacción: se bloquean las filas con FOR UPDATE,
 * se valida, se inserta el pedido con su detalle y se descuenta. Si algo
 * falla, ROLLBACK deja la base exactamente como estaba.
 */
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

  // El total NUNCA se toma del cliente: se recalcula aquí con los precios
  // de la base. Solo se acepta la moneda, y solo si está en la tabla.
  const moneda = TASAS[cliente.moneda] ? cliente.moneda : 'USD';

  let conn;

  try {
    // La validación de forma va dentro del try: si una cantidad llega
    // mal formada, su ErrorNegocio debe terminar en un 400 legible y no
    // escaparse como un 500.
    const lineas = items.map(leerLinea);
    const tasa = tasaDe(moneda);

    conn = await pool.getConnection();

    await conn.beginTransaction();

    // 1) Bloquear y validar cada producto antes de tocar nada.
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

    // 2) Total recalculado en el servidor.
    const { subtotal, envio, total } = calcularTotales(productos, moneda);

    // 3) Cabecera del pedido con los datos de facturación.
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

    // 4) Detalle del pedido.
    //    `precio` guarda el precio base del catálogo y `subtotal` lo que se
    //    cobró por esa línea, ya convertido a la moneda del pago.
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

    // 5) Descontar stock. El `stock >= ?` es una segunda barrera: si otra
    //    compra entró entre la validación y aquí, affectedRows será 0 y
    //    la transacción se deshace entera.
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
    // Si hubo conexión y transacción abierta, se deshace todo.
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

/**
 * OBTENER PEDIDOS (SOLO ADMIN)
 *
 * Son dos consultas y no una por pedido: primero todas las cabeceras y
 * después todo el detalle de golpe con un IN. Pedir el detalle pedido a
 * pedido sería N+1: con 200 pedidos, 201 viajes a la base.
 *
 * Los DECIMAL llegan como cadena desde mysql2, así que se convierten a
 * número aquí para que el panel no tenga que hacerlo en cada celda.
 */
const obtenerPedidos = async (req, res) => {
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
              u.email     AS usuario_email
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

    // El detalle viene en una lista plana: se agrupa por pedido.
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
