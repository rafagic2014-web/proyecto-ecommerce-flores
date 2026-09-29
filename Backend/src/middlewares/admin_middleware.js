
/**
 * MIDDLEWARE ADMIN
 * Middleware controla el acceso a rutas protegidas
 * Solo permite continuar si el usuario es admin
 */
const esAdmin = (req, res, next) => {

  /**
 * VALIDACIÓN DEL ROL
   * req.user viene del auth_middleware (token JWT)
   */
  if (req.user.rol !== 'admin') {

 // BLOQUEAR SI NO ES ADMIN
    return res.status(403).json({
 mensaje: 'Acceso solo para administradores'
    });
  }

  /**
 * SI ES ADMIN → CONTINÚA
   */
  next();
};

module.exports = esAdmin;
