const express = require('express');
const router = express.Router();

const verificarToken = require('../middlewares/auth_middleware');
const esAdmin = require('../middlewares/admin_middleware');
const pedidosController = require('../controllers/pedidos_controller');

/**
 * CREAR PEDIDO (CLIENTES LOGUEADOS)
 *
 * El pago es una operación con estado: descuenta stock, inserta el pedido y
 * su detalle. Se hace en una transacción del servidor, no con varias
 * peticiones sueltas desde el navegador.
 */
router.post('/', verificarToken, pedidosController.crearPedido);

/**
 * LISTAR PEDIDOS (SOLO ADMIN)
 *
 * El panel de gestión necesita ver todas las compras. Se protege con
 * verificarToken + esAdmin: un cliente autenticado recibe 403, y sin
 * token ni siquiera pasa la primera comprobación.
 */
router.get('/', verificarToken, esAdmin, pedidosController.obtenerPedidos);

module.exports = router;
