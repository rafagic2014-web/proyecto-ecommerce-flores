// Importa las funciones del controlador de productos a probar.
const productosController = require('../../controllers/productos_controller'); 

// Importa el archivo de conexión a la base de datos para simularlo.
const connection = require('../../bd/connections');

// Reemplaza la base de datos real con un objeto simulado donde query es una función falsa.
jest.mock('../../bd/connections.js', () => ({
  query: jest.fn()
}));

// Agrupa todas las pruebas relacionadas con la función descontarStock.
describe('Pruebas Unitarias - Descontar Stock', () => {
  // Declara las variables para los objetos de petición req y respuesta res.
  let req, res;

  // Se ejecuta automáticamente antes de cada prueba individual.
  beforeEach(() => {
    // Limpia el historial de ejecuciones de los mocks.
    jest.clearAllMocks();

    // Resetea 'req' con params y body vacíos.
    req = { params: {}, body: {} };

    // Simula los métodos status() y json() de la respuesta de Express.
    res = {
      // mockReturnThis permite encadenar: res.status(400).json(...)
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
  });

  // Bloque contenedor de pruebas específicas para descontarStock.
  describe('descontarStock', () => {

    // VALIDACIÓN DE ID: Rechaza IDs negativos.
    test('Debe retornar 400 con id negativo', () => {
      req.body = { id: -1, cantidad: 5 };
      console.log('\n[TEST] descontarStock - ID negativo (400)');
      console.log('  Input: req.body =', JSON.stringify(req.body));

      try {
        productosController.descontarStock(req, res);
        console.log('  Variables evaluadas -> req:', JSON.stringify(req), '| res.status:', JSON.stringify(res.status.mock.calls), '| res.json:', JSON.stringify(res.json.mock.calls), '| dbCalls:', connection.query.mock.calls.length);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ mensaje: 'Producto inválido' });
        expect(connection.query).not.toHaveBeenCalled();
        console.log('  ✓ POSITIVO - Output: res.status(400), res.json =', JSON.stringify({ mensaje: 'Producto inválido' }));
      } catch (error) {
        console.log('  ✗ NEGATIVO - Expected: res.status(400), res.json =', JSON.stringify({ mensaje: 'Producto inválido' }));
        console.log('  ✗ NEGATIVO - Error:', error.message);
        throw error;
      }
    });

    // VALIDACIÓN DE ID: Rechaza ID igual a cero.
    test('Debe retornar 400 con id cero', () => {
      req.body = { id: 0, cantidad: 5 };
      console.log('\n[TEST] descontarStock - ID cero (400)');
      console.log('  Input: req.body =', JSON.stringify(req.body));

      try {
        productosController.descontarStock(req, res);
        console.log('  Variables evaluadas -> req:', JSON.stringify(req), '| res.status:', JSON.stringify(res.status.mock.calls), '| res.json:', JSON.stringify(res.json.mock.calls), '| dbCalls:', connection.query.mock.calls.length);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ mensaje: 'Producto inválido' });
        expect(connection.query).not.toHaveBeenCalled();
        console.log('  ✓ POSITIVO - Output: res.status(400), res.json =', JSON.stringify({ mensaje: 'Producto inválido' }));
      } catch (error) {
        console.log('  ✗ NEGATIVO - Expected: res.status(400), res.json =', JSON.stringify({ mensaje: 'Producto inválido' }));
        console.log('  ✗ NEGATIVO - Error:', error.message);
        throw error;
      }
    });

    // VALIDACIÓN DE ID: Rechaza números decimales/flotantes.
    test('Debe retornar 400 con id flotante', () => {
      req.body = { id: 1.5, cantidad: 5 };
      console.log('\n[TEST] descontarStock - ID flotante (400)');
      console.log('  Input: req.body =', JSON.stringify(req.body));

      try {
        productosController.descontarStock(req, res);
        console.log('  Variables evaluadas -> req:', JSON.stringify(req), '| res.status:', JSON.stringify(res.status.mock.calls), '| res.json:', JSON.stringify(res.json.mock.calls), '| dbCalls:', connection.query.mock.calls.length);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ mensaje: 'Producto inválido' });
        expect(connection.query).not.toHaveBeenCalled();
        console.log('  ✓ POSITIVO - Output: res.status(400), res.json =', JSON.stringify({ mensaje: 'Producto inválido' }));
      } catch (error) {
        console.log('  ✗ NEGATIVO - Expected: res.status(400), res.json =', JSON.stringify({ mensaje: 'Producto inválido' }));
        console.log('  ✗ NEGATIVO - Error:', error.message);
        throw error;
      }
    });

    // VALIDACIÓN DE ID: Rechaza cadenas de texto no numéricas.
    test('Debe retornar 400 con id no numérico', () => {
      req.body = { id: 'abc', cantidad: 5 };
      console.log('\n[TEST] descontarStock - ID no numérico (400)');
      console.log('  Input: req.body =', JSON.stringify(req.body));

      try {
        productosController.descontarStock(req, res);
        console.log('  Variables evaluadas -> req:', JSON.stringify(req), '| res.status:', JSON.stringify(res.status.mock.calls), '| res.json:', JSON.stringify(res.json.mock.calls), '| dbCalls:', connection.query.mock.calls.length);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ mensaje: 'Producto inválido' });
        expect(connection.query).not.toHaveBeenCalled();
        console.log('  ✓ POSITIVO - Output: res.status(400), res.json =', JSON.stringify({ mensaje: 'Producto inválido' }));
      } catch (error) {
        console.log('  ✗ NEGATIVO - Expected: res.status(400), res.json =', JSON.stringify({ mensaje: 'Producto inválido' }));
        console.log('  ✗ NEGATIVO - Error:', error.message);
        throw error;
      }
    });

    // VALIDACIÓN DE ID: Rechaza valores nulos.
    test('Debe retornar 400 con id null', () => {
      req.body = { id: null, cantidad: 5 };
      console.log('\n[TEST] descontarStock - ID null (400)');
      console.log('  Input: req.body =', JSON.stringify(req.body));

      try {
        productosController.descontarStock(req, res);
        console.log('  Variables evaluadas -> req:', JSON.stringify(req), '| res.status:', JSON.stringify(res.status.mock.calls), '| res.json:', JSON.stringify(res.json.mock.calls), '| dbCalls:', connection.query.mock.calls.length);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ mensaje: 'Producto inválido' });
        expect(connection.query).not.toHaveBeenCalled();
        console.log('  ✓ POSITIVO - Output: res.status(400), res.json =', JSON.stringify({ mensaje: 'Producto inválido' }));
      } catch (error) {
        console.log('  ✗ NEGATIVO - Expected: res.status(400), res.json =', JSON.stringify({ mensaje: 'Producto inválido' }));
        console.log('  ✗ NEGATIVO - Error:', error.message);
        throw error;
      }
    });

    // VALIDACIÓN DE ID: Rechaza cuando el ID no es enviado en la petición.
    test('Debe retornar 400 con id undefined', () => {
      req.body = { cantidad: 5 };
      console.log('\n[TEST] descontarStock - ID undefined (400)');
      console.log('  Input: req.body =', JSON.stringify(req.body));

      try {
        productosController.descontarStock(req, res);
        console.log('  Variables evaluadas -> req:', JSON.stringify(req), '| res.status:', JSON.stringify(res.status.mock.calls), '| res.json:', JSON.stringify(res.json.mock.calls), '| dbCalls:', connection.query.mock.calls.length);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ mensaje: 'Producto inválido' });
        expect(connection.query).not.toHaveBeenCalled();
        console.log('  ✓ POSITIVO - Output: res.status(400), res.json =', JSON.stringify({ mensaje: 'Producto inválido' }));
      } catch (error) {
        console.log('  ✗ NEGATIVO - Expected: res.status(400), res.json =', JSON.stringify({ mensaje: 'Producto inválido' }));
        console.log('  ✗ NEGATIVO - Error:', error.message);
        throw error;
      }
    });

    // VALIDACIÓN DE CANTIDAD: Rechaza cantidades negativas.
    test('Debe retornar 400 con cantidad negativa', () => {
      req.body = { id: 10, cantidad: -5 };
      console.log('\n[TEST] descontarStock - Cantidad negativa (400)');
      console.log('  Input: req.body =', JSON.stringify(req.body));

      try {
        productosController.descontarStock(req, res);
        console.log('  Variables evaluadas -> req:', JSON.stringify(req), '| res.status:', JSON.stringify(res.status.mock.calls), '| res.json:', JSON.stringify(res.json.mock.calls), '| dbCalls:', connection.query.mock.calls.length);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ mensaje: 'Cantidad inválida' });
        expect(connection.query).not.toHaveBeenCalled();
        console.log('  ✓ POSITIVO - Output: res.status(400), res.json =', JSON.stringify({ mensaje: 'Cantidad inválida' }));
      } catch (error) {
        console.log('  ✗ NEGATIVO - Expected: res.status(400), res.json =', JSON.stringify({ mensaje: 'Cantidad inválida' }));
        console.log('  ✗ NEGATIVO - Error:', error.message);
        throw error;
      }
    });

    // VALIDACIÓN DE CANTIDAD: Rechaza cantidades iguales a cero.
    test('Debe retornar 400 con cantidad cero', () => {
      req.body = { id: 10, cantidad: 0 };
      console.log('\n[TEST] descontarStock - Cantidad cero (400)');
      console.log('  Input: req.body =', JSON.stringify(req.body));

      try {
        productosController.descontarStock(req, res);
        console.log('  Variables evaluadas -> req:', JSON.stringify(req), '| res.status:', JSON.stringify(res.status.mock.calls), '| res.json:', JSON.stringify(res.json.mock.calls), '| dbCalls:', connection.query.mock.calls.length);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ mensaje: 'Cantidad inválida' });
        expect(connection.query).not.toHaveBeenCalled();
        console.log('  ✓ POSITIVO - Output: res.status(400), res.json =', JSON.stringify({ mensaje: 'Cantidad inválida' }));
      } catch (error) {
        console.log('  ✗ NEGATIVO - Expected: res.status(400), res.json =', JSON.stringify({ mensaje: 'Cantidad inválida' }));
        console.log('  ✗ NEGATIVO - Error:', error.message);
        throw error;
      }
    });

    // VALIDACIÓN DE CANTIDAD: Rechaza números decimales/flotantes.
    test('Debe retornar 400 con cantidad decimal', () => {
      req.body = { id: 10, cantidad: 2.5 };
      console.log('\n[TEST] descontarStock - Cantidad decimal (400)');
      console.log('  Input: req.body =', JSON.stringify(req.body));

      try {
        productosController.descontarStock(req, res);
        console.log('  Variables evaluadas -> req:', JSON.stringify(req), '| res.status:', JSON.stringify(res.status.mock.calls), '| res.json:', JSON.stringify(res.json.mock.calls), '| dbCalls:', connection.query.mock.calls.length);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ mensaje: 'Cantidad inválida' });
        expect(connection.query).not.toHaveBeenCalled();
        console.log('  ✓ POSITIVO - Output: res.status(400), res.json =', JSON.stringify({ mensaje: 'Cantidad inválida' }));
      } catch (error) {
        console.log('  ✗ NEGATIVO - Expected: res.status(400), res.json =', JSON.stringify({ mensaje: 'Cantidad inválida' }));
        console.log('  ✗ NEGATIVO - Error:', error.message);
        throw error;
      }
    });

    // VALIDACIÓN DE CANTIDAD: Rechaza cadenas no convertibles a enteros válidos.
    test('Debe retornar 400 con cantidad no numérica', () => {
      req.body = { id: 10, cantidad: 'abc' };
      console.log('\n[TEST] descontarStock - Cantidad no numérica (400)');
      console.log('  Input: req.body =', JSON.stringify(req.body));

      try {
        productosController.descontarStock(req, res);
        console.log('  Variables evaluadas -> req:', JSON.stringify(req), '| res.status:', JSON.stringify(res.status.mock.calls), '| res.json:', JSON.stringify(res.json.mock.calls), '| dbCalls:', connection.query.mock.calls.length);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ mensaje: 'Cantidad inválida' });
        expect(connection.query).not.toHaveBeenCalled();
        console.log('  ✓ POSITIVO - Output: res.status(400), res.json =', JSON.stringify({ mensaje: 'Cantidad inválida' }));
      } catch (error) {
        console.log('  ✗ NEGATIVO - Expected: res.status(400), res.json =', JSON.stringify({ mensaje: 'Cantidad inválida' }));
        console.log('  ✗ NEGATIVO - Error:', error.message);
        throw error;
      }
    });

    // CASO DE ÉXITO: Parsea strings numéricos a enteros y descuenta stock correctamente.
    test('Debe parsear strings numéricos y descontar stock con éxito', () => {
      req.body = { id: '10', cantidad: '3' };
      console.log('\n[TEST] descontarStock - Éxito (strings numéricos)');
      console.log('  Input: req.body =', JSON.stringify(req.body));

      try {
        // Simula la respuesta exitosa de la consulta SQL.
        connection.query.mockImplementation((sql, params, callback) => {
          // Confirma que '10' y '3' fueron convertidos a los números 3, 10 y 3.
          expect(params).toEqual([3, 10, 3]);
          callback(null, { affectedRows: 1 }); // 1 fila modificada.
        });

        productosController.descontarStock(req, res);
        console.log('  Variables evaluadas -> req:', JSON.stringify(req), '| res.status:', JSON.stringify(res.status.mock.calls), '| res.json:', JSON.stringify(res.json.mock.calls), '| dbCalls:', connection.query.mock.calls.length);

        // Confirma respuesta exitosa en JSON.
        expect(res.json).toHaveBeenCalledWith({ mensaje: 'Stock actualizado' });
        console.log('  ✓ POSITIVO - Output: res.json =', JSON.stringify({ mensaje: 'Stock actualizado' }));
      } catch (error) {
        console.log('  ✗ NEGATIVO - Expected: res.json =', JSON.stringify({ mensaje: 'Stock actualizado' }));
        console.log('  ✗ NEGATIVO - Error:', error.message);
        throw error;
      }
    });

    // CASO STOCK INSUFICIENTE / INACTIVO: AffectedRows es 0 en la consulta SQL.
    test('Debe retornar 400 si el stock es insuficiente o el producto está inactivo', () => {
      req.body = { id: 10, cantidad: 500 };
      console.log('\n[TEST] descontarStock - Stock insuficiente (400)');
      console.log('  Input: req.body =', JSON.stringify(req.body));

      try {
        connection.query.mockImplementation((sql, params, callback) => {
          // Ninguna fila cumplió la condición (affectedRows: 0).
          callback(null, { affectedRows: 0 });
        });

        productosController.descontarStock(req, res);
        console.log('  Variables evaluadas -> req:', JSON.stringify(req), '| res.status:', JSON.stringify(res.status.mock.calls), '| res.json:', JSON.stringify(res.json.mock.calls), '| dbCalls:', connection.query.mock.calls.length);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ mensaje: 'Stock insuficiente o producto no disponible' });
        console.log('  ✓ POSITIVO - Output: res.status(400), res.json =', JSON.stringify({ mensaje: 'Stock insuficiente o producto no disponible' }));
      } catch (error) {
        console.log('  ✗ NEGATIVO - Expected: res.status(400), res.json =', JSON.stringify({ mensaje: 'Stock insuficiente o producto no disponible' }));
        console.log('  ✗ NEGATIVO - Error:', error.message);
        throw error;
      }
    });

    // ERROR DE BD: Falla en la consulta SQL.
    test('Debe retornar 500 ante error de base de datos', () => {
      req.body = { id: 10, cantidad: 2 };
      console.log('\n[TEST] descontarStock - Error BD (500)');
      console.log('  Input: req.body =', JSON.stringify(req.body));

      try {
        // Simula un fallo retornado por MySQL.
        connection.query.mockImplementation((sql, params, callback) => {
          callback(new Error('Error SQL al descontar stock'), null);
        });

        productosController.descontarStock(req, res);
        console.log('  Variables evaluadas -> req:', JSON.stringify(req), '| res.status:', JSON.stringify(res.status.mock.calls), '| res.json:', JSON.stringify(res.json.mock.calls), '| dbCalls:', connection.query.mock.calls.length);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({ error: 'Error SQL al descontar stock' });
        console.log('  ✓ POSITIVO - Output: res.status(500), res.json =', JSON.stringify({ error: 'Error SQL al descontar stock' }));
      } catch (error) {
        console.log('  ✗ NEGATIVO - Expected: res.status(500), res.json =', JSON.stringify({ error: 'Error SQL al descontar stock' }));
        console.log('  ✗ NEGATIVO - Error:', error.message);
        throw error;
      }
    });

  });
});