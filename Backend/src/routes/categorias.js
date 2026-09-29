const express = require('express');
const router = express.Router();

const verificarToken = require('../middlewares/auth_middleware');
const esAdmin = require('../middlewares/admin_middleware');
const categoriasController = require('../controllers/categorias_controller');

/**
 * GET CATEGORÍAS (PÚBLICA)
 */
router.get('/', categoriasController.getCategorias);


/**
 * POST CATEGORÍA (SOLO ADMIN)
 * Crear categoría nueva
 */
router.post(
  '/',
  verificarToken,
  esAdmin,
  categoriasController.createCategoria
);


/**
 * ELIMINAR CATEGORÍA (SOFT DELETE, SOLO ADMIN)
 */
router.delete(
  '/:id',
  verificarToken,
  esAdmin,
  categoriasController.deleteCategoria
);

module.exports = router;
