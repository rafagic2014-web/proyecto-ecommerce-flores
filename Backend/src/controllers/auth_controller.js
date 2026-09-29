
// IMPORTAR CONEXIÓN A LA BASE DE DATOS
const connection = require('../bd/connections');

// LIBRERÍA PARA ENCRIPTAR PASSWORDS
const bcrypt = require('bcryptjs');

// LIBRERÍA PARA GENERAR TOKENS JWT
const jwt = require('jsonwebtoken');

// CARGAR VARIABLES DE ENTORNO
require('dotenv').config();

// Versión con promesas del pool, para las funciones que usan await
const pool = connection.promise();


/**
 * REGISTER
 */

    /**
 * REGISTER
     *
     * El hasheo usa `bcrypt.hash` (con promesas) y no `hashSync`: hashear
     * con coste 10 tarda decenas de milisegundos y, de forma síncrona,
     * bloquea TODAS las peticiones del servidor durante ese tiempo.
     */
    const register = async (req, res) => {

 // EXTRAER DATOS DEL BODY (REQUEST)
      // Aquí obtenemos lo que envía el frontend
      const { nombre, email, password } = req.body;

      // ============================
 // VALIDACIÓN DE CAMPOS
      // ============================
      // Evita que lleguen datos vacíos al backend
      if (!nombre || !email || !password) {
        return res.status(400).json({
 mensaje: "Todos los campos son obligatorios"
        });
      }

      // ============================
 // NORMALIZAR Y VALIDAR EMAIL
      // ============================
      // El frontend ya recorta, pero la ruta es pública: se normaliza
      // aquí para no registrar " Ana@X.com " y "ana@x.com" por separado.
      const correo = String(email).trim().toLowerCase();

      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo)) {
        return res.status(400).json({
 mensaje: "Email inválido"
        });
      }

      if (String(password).length < 6) {
        return res.status(400).json({
 mensaje: "La contraseña debe tener al menos 6 caracteres"
        });
      }

      try {
        // ============================
 // VERIFICAR SI EXISTE EL USUARIO
        // ============================
        const [existentes] = await pool.query(
          "SELECT id FROM usuarios WHERE email = ?",
          [correo]
        );

        if (existentes.length > 0) {
          return res.status(400).json({
 mensaje: "El usuario ya existe"
          });
        }

        // ============================
 // ENCRIPTAR PASSWORD
        // ============================
        // Protege la contraseña antes de guardarla
        const hashedPassword = await bcrypt.hash(password, 10);

        // ============================
 // INSERTAR USUARIO EN BD
        // ============================
        const [resultado] = await pool.query(
          `INSERT INTO usuarios (nombre, email, password, rol, estado_activo)
           VALUES (?, ?, ?, 'cliente', 1)`,
          [nombre, correo, hashedPassword]
        );

        // ============================
 // GENERAR TOKEN JWT
        // ============================
        // Permite login automático después de registrar.
        // Incluye `id` igual que en login para que el panel de
        // usuarios pueda reconocerse a sí mismo.
        const token = jwt.sign(
          {
            id: resultado.insertId,
            nombre: nombre,
            email: correo,
            rol: "cliente"
          },
          process.env.JWT_SECRET,
          {
            expiresIn: "2h"
          }
        );

        // ============================
 // RESPUESTA FINAL
        // ============================
        res.json({
 mensaje: "Usuario registrado",
          token
        });
      } catch (err) {
        console.error("ERROR REGISTER:", err);
        res.status(500).json({ error: err.message });
      }
    };




/**
 * LOGIN
 *
 * La comparación usa `bcrypt.compare` y no `compareSync`: comparar un hash
 * con coste 10 tarda decenas de milisegundos y, de forma síncrona, detiene
 * el resto de la API mientras tanto.
 */
const login = async (req, res) => {

  const { email, password } = req.body;

  if (!email || !password) {
 return res.status(400).json({ mensaje: 'Correo y contraseña son obligatorios' });
  }

  // Se normaliza igual que en el registro: si alguien se.Inscribe como
  // " Ana@X.com ", debe poder entrar escribiendo "ana@x.com".
  const correo = String(email).trim().toLowerCase();

  try {
    const [results] = await pool.query(
      'SELECT * FROM usuarios WHERE email = ?',
      [correo]
    );

    if (results.length === 0) {
 return res.status(404).json({ mensaje: 'Usuario no encontrado' });
    }

    const user = results[0];

    const validPassword = await bcrypt.compare(password, user.password);

    if (!validPassword) {
 return res.status(401).json({ mensaje: 'Contraseña incorrecta' });
    }

    if (user.estado_activo === 0) {
 return res.status(403).json({ mensaje: 'Usuario inactivo' });
    }

    const token = jwt.sign(
      {
        id: user.id,
        nombre: user.nombre,
        email: user.email,
        rol: user.rol
      },
      process.env.JWT_SECRET,
      {
        expiresIn: '2h'
      }
    );

    res.json({
 mensaje: 'Login exitoso',
      token
    });
  } catch (err) {
    console.error('ERROR LOGIN:', err);
    res.status(500).json({ error: err.message });
  }
};


/**
 * OBTENER USUARIOS
 * Solo administradores. Nunca devuelve el campo `password`.
 */
const getUsuarios = (req, res) => {

  const sql =`
    SELECT id, nombre, email, rol, estado_activo, created_at
    FROM usuarios
    ORDER BY (rol = 'admin') DESC, nombre
  `;

  connection.query(sql, (err, results) => {

    if (err) {
      return res.status(500).json({ error: err.message });
    }

    res.json(results);
  });
};


/**
 * ACTUALIZAR USUARIO (rol / estado)
 *
 * Protecciones: el admin no puede desactivarse ni quitarse el rol a sí
 * mismo, y no se puede dejar la tabla sin ningún admin activo.
 */
const actualizarUsuario = (req, res) => {

  const { id } = req.params;
  const { rol, estado_activo } = req.body;

  if (rol && !['cliente', 'admin'].includes(rol)) {
 return res.status(400).json({ mensaje: "Rol inválido" });
  }

  if (estado_activo !== undefined && estado_activo !== 0 && estado_activo !== 1) {
 return res.status(400).json({ mensaje: "Estado inválido" });
  }

  if (!rol && estado_activo === undefined) {
 return res.status(400).json({ mensaje: "No hay cambios para guardar" });
  }

  const adminId = req.user?.id;
  const esPropio = Number(id) === Number(adminId);

  // Un admin que se degrada o se desactiva a sí mismo se queda sin panel
  if (esPropio) {
    if (rol && rol !== 'admin') {
 return res.status(400).json({ mensaje: "No puedes quitarte el rol de administrador" });
    }
    if (estado_activo === 0) {
 return res.status(400).json({ mensaje: "No puedes desactivar tu propia cuenta" });
    }
  }

  const campos = [];
  const valores = [];

  if (rol) {
    campos.push('rol = ?');
    valores.push(rol);
  }
  if (estado_activo !== undefined) {
    campos.push('estado_activo = ?');
    valores.push(estado_activo);
  }

  const sql = `UPDATE usuarios SET ${campos.join(', ')} WHERE id = ?`;
  valores.push(id);

  connection.query(sql, valores, (err) => {

    if (err) {
      return res.status(500).json({ error: err.message });
    }

    /**
     * Verifica que quede al menos un admin activo.
     * Si el cambio acaba de quitar al último, se revierte.
     */
    if (rol === 'cliente' || estado_activo === 0) {
      const checkSql =`
        SELECT COUNT(*) AS total
        FROM usuarios
        WHERE rol = 'admin' AND estado_activo = 1 AND id <> ?
      `;

      connection.query(checkSql, [id], (errCheck, resCheck) => {

        if (errCheck) {
          return res.status(500).json({ error: errCheck.message });
        }

        if (resCheck[0].total === 0) {
          const rollback =`
            UPDATE usuarios
            SET rol = 'admin', estado_activo = 1
            WHERE id = ?
          `;

          return connection.query(rollback, [id], () => {
            res.status(400).json({
 mensaje: "Debe existir al menos un administrador activo"
            });
          });
        }

 res.json({ mensaje: "Usuario actualizado" });

      });

      return;
    }

 res.json({ mensaje: "Usuario actualizado" });

  });
};


/**
 * EXPORTAR FUNCIONES
 */
module.exports = {
  register,
  login,
  getUsuarios,
  actualizarUsuario
};
