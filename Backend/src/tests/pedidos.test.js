const { crearPedido, obtenerPedidos } = require('../controllers/pedidos_controller.js');
const connection = require('../bd/connections.js');
const { tasaDe, calcularTotales } = require('../lib/moneda');

// Mockear dependencias
jest.mock('../bd/connections', () => ({
  promise: jest.fn(),
}));

jest.mock('../lib/moneda', () => ({
  TASAS: { USD: 1, EUR: 0.85 },
  tasaDe: jest.fn((moneda) => (moneda === 'EUR' ? 0.85 : 1)),
  calcularTotales: jest.fn(() => ({ subtotal: 45, envio: 5, total: 50 })),
}));

describe('Pétalos & Encanto - Controlador de Pedidos', () => {
  let mockPool;
  let mockConn;
  let req;
  let res;

  beforeEach(() => {
    jest.clearAllMocks();

    // Configurar objeto conexión simulado para transacciones
    mockConn = {
      beginTransaction: jest.fn().mockResolvedValue(),
      commit: jest.fn().mockResolvedValue(),
      rollback: jest.fn().mockResolvedValue(),
      release: jest.fn(),
      query: jest.fn(),
    };

    // Configurar pool simulado
    mockPool = {
      getConnection: jest.fn().mockResolvedValue(mockConn),
      query: jest.fn(),
    };

    connection.promise.mockReturnValue(mockPool);

    // Datos simulados de un cliente ordenando arreglos florales
    req = {
      user: { id: 1 },
      body: {
        cliente: { 
          moneda: 'USD', 
          nombre: 'María Gómez', 
          cedula: '0912345678', 
          direccion: 'Av. de las Rosas 402', 
          pais: 'Ecuador' 
        },
        items: [{ id: 101, cantidad: 1 }], // Ej: Ramo de Rosas Ecuatorianas
      },
    };

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
  });

  describe('crearPedido', () => {
    test('debe retornar 401 si no hay una sesión de usuario activa', async () => {
      req.user = null;

      await crearPedido(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ mensaje: 'Sesión no válida' });
    });

    test('debe retornar 400 si el carrito de flores está vacío', async () => {
      req.body.items = [];

      await crearPedido(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ mensaje: 'El pedido está vacío' });
    });

    test('debe retornar 400 si el ID del arreglo floral es inválido', async () => {
      req.body.items = [{ id: 'flor-magica', cantidad: 1 }];

      await crearPedido(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ mensaje: 'El pedido tiene un producto inválido.' });
    });

    test('debe registrar el pedido de flores exitosamente', async () => {
      // Simular respuestas de base de datos para la florería
      mockConn.query
        .mockResolvedValueOnce([[{ id: 101, nombre: 'Ramo de Rosas Rojas', precio: 45, stock: 15, estado_activo: true }]]) // SELECT FOR UPDATE
        .mockResolvedValueOnce([{ insertId: 50 }]) // INSERT pedidos
        .mockResolvedValueOnce([]) // INSERT pedido_detalle
        .mockResolvedValueOnce([{ affectedRows: 1 }]); // UPDATE productos (descontar stock)

      await crearPedido(req, res);

      expect(mockConn.beginTransaction).toHaveBeenCalled();
      expect(mockConn.commit).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          mensaje: 'Pedido realizado',
          pedido: expect.objectContaining({ id: 50, total: 50 }),
        })
      );
      expect(mockConn.release).toHaveBeenCalled();
    });

    test('debe hacer rollback si no hay suficientes flores en stock', async () => {
      // Simular stock agotado para el arreglo floral
      mockConn.query.mockResolvedValueOnce([
        [{ id: 101, nombre: 'Ramo de Rosas Rojas', precio: 45, stock: 0, estado_activo: true }],
      ]);

      await crearPedido(req, res);

      expect(mockConn.rollback).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        mensaje: 'Stock insuficiente de "Ramo de Rosas Rojas": quedan 0 y pediste 1',
      });
      expect(mockConn.release).toHaveBeenCalled();
    });

    test('debe rechazar la compra si el arreglo floral ya no está disponible (inactivo)', async () => {
      mockConn.query.mockResolvedValueOnce([
        [{ id: 102, nombre: 'Girasoles de Temporada', precio: 30, stock: 10, estado_activo: false }],
      ]);

      await crearPedido(req, res);

      expect(mockConn.rollback).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        mensaje: '"Girasoles de Temporada" ya no está disponible',
      });
      expect(mockConn.release).toHaveBeenCalled();
    });
  });

  describe('obtenerPedidos', () => {
    test('debe retornar los pedidos con sus detalles de arreglos florales agrupados', async () => {
      const pedidosMock = [
        {
          id: 50,
          total: '50.00',
          fecha: '2026-06-01 10:00:00',
          cedula: '0912345678',
          nombre_cliente: 'María Gómez',
          direccion: 'Av. de las Rosas 402',
          pais: 'Ecuador',
          moneda: 'USD',
          usuario_nombre: 'Cliente Web',
          usuario_email: 'maria@test.com',
        },
      ];

      const detalleMock = [
        {
          pedido_id: 50,
          producto_id: 101,
          nombre: 'Ramo de Rosas Rojas',
          precio: '45.00',
          cantidad: 1,
          subtotal: '45.00',
        },
      ];

      mockPool.query
        .mockResolvedValueOnce([pedidosMock])
        .mockResolvedValueOnce([detalleMock]);

      await obtenerPedidos(req, res);

      expect(res.json).toHaveBeenCalledWith([
        expect.objectContaining({
          id: 50,
          total: 50,
          detalle: [
            expect.objectContaining({
              producto_id: 101,
              nombre: 'Ramo de Rosas Rojas',
              precio: 45,
            }),
          ],
        }),
      ]);
    });
  });
});