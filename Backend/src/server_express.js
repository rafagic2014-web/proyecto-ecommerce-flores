const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
require('dotenv').config();
const connection = require('./bd/connections');

// inicializar app
const app = express();

// middlewares
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// ruta prueba
app.get('/', (req, res) => {
 res.send('API ok');
});

// importar rutas
const authRoutes = require('./routes/auth');
const productosRoutes = require('./routes/productos');
const categoriasRoutes = require('./routes/categorias');
const pedidosRoutes = require('./routes/pedidos');

// rutas
app.use('/api/auth', authRoutes);
app.use('/api/productos', productosRoutes);
app.use('/api/categorias', categoriasRoutes);
app.use('/api/pedidos', pedidosRoutes);

// ruta inexistente: se responde en JSON para que el frontend
// pueda leer res.data.mensaje en vez de recibir HTML
app.use((req, res) => {
  res.status(404).json({ mensaje: `Ruta no encontrada: ${req.method} ${req.originalUrl}` });
});

// estado de la base de datos al arrancar
const sinNombreDeBase = (mensaje) => String(mensaje).split(process.env.DB_NAME).join('***');

connection.query('SELECT 1', (err) => {
  if (err) {
    console.log(` Base de datos: SIN CONEXIÓN (${sinNombreDeBase(err.message)})`);
  } else {
    console.log(' Base de datos: conectada');
  }
});

// puerto
const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
 console.log(` Servidor en puerto ${PORT}`);
});
