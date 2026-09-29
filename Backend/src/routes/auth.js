const express = require('express');
const router = express.Router();

const authController = require('../controllers/auth_controller');
const verificarToken = require('../middlewares/auth_middleware');
const esAdmin = require('../middlewares/admin_middleware');

/**
 * RUTAS
 * register y login son públicas. El resto exige sesión de administrador.
 */
router.post('/register', authController.register);
router.post('/login', authController.login);

router.get('/usuarios', verificarToken, esAdmin, authController.getUsuarios);
router.patch('/usuarios/:id', verificarToken, esAdmin, authController.actualizarUsuario);

module.exports = router;
