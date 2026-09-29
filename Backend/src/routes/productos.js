// IMPORTAR EXPRESS
const express = require('express');
const router = express.Router();

/**
 * IMPORTAR MIDDLEWARES
 */
const verificarToken = require('../middlewares/auth_middleware');
const esAdmin = require('../middlewares/admin_middleware');

/**
 * IMPORTAR CONTROLADOR
 */
const productosController = require('../controllers/productos_controller');


/**
 * ======================================================
 * PRODUCTOS PÚBLICOS (CATÁLOGO)
 * ======================================================
 */
router.get(
  '/',
  productosController.getProductos
);


/**
 * ======================================================
 * FILTRAR POR CATEGORÍA (PÚBLICO)
 * ======================================================
 */
router.get(
  '/categoria/:categoria_id',
  productosController.getProductosPorCategoria
);


/**
 * ======================================================
 * RUTA DE COMPRA (CLIENTES LOGUEADOS)
 * IMPORTANTE: VA ANTES DE /:id
 * ======================================================
 */
router.put(
  '/stock',
  verificarToken,
  productosController.descontarStock
);


/**
 * ======================================================
 * ADMIN → VER TODOS LOS PRODUCTOS
 * ======================================================
 */
router.get(
  '/admin',
  verificarToken,
  esAdmin,
  productosController.getTodosProductos
);


/**
 * ======================================================
 * CREAR PRODUCTO (SOLO ADMIN)
 * ======================================================
 */
router.post(
  '/',
  verificarToken,
  esAdmin,
  productosController.createProducto
);


/**
 * ======================================================
 * ACTUALIZAR PRODUCTO (SOLO ADMIN)
 * ======================================================
 * IMPORTANTE: DESPUÉS DE /stock
 */
router.put(
  '/:id',
  verificarToken,
  esAdmin,
  productosController.updateProducto
);


/**
 * ======================================================
 * ELIMINAR PRODUCTO (SOFT DELETE)
 * ======================================================
 */
router.delete(
  '/:id',
  verificarToken,
  esAdmin,
  productosController.deleteProducto
);


/**
 * ======================================================
 * REACTIVAR PRODUCTO (SOLO ADMIN)
 * ======================================================
 */
router.put(
  '/activar/:id',
  verificarToken,
  esAdmin,
  productosController.activarProducto
);


/**
 * EXPORTAR RUTAS
 */
module.exports = router;
