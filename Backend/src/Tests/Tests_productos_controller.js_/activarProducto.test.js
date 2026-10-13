// Importa las funciones del controlador de productos para poder probarlas.
const productosController = require('../../controllers/productos_controller'); 

// Importa el módulo de la base de datos para poder simularlo o mockearlo.
const connection = require('../../bd/connections');

// Reemplaza la base de datos real con una falsa donde query es una función simulada de Jest.
jest.mock('../../bd/connections.js', () => ({
  query: jest.fn()
}));

// Agrupa todas las pruebas de este archivo bajo un título descriptivo.
describe('Pruebas Unitarias - Activar Producto', () => {
  // Declara las variables que simularán la petición req y respuesta res de Express.
  let req, res;

  // Se ejecuta automáticamente ANTES de cada prueba test para limpiar y preparar el entorno.
  beforeEach(() => {
    // Borra el historial de llamadas de las funciones falsas resetea los contadores de Jest.
    jest.clearAllMocks();

    // Inicializa req como un objeto con parámetros de URL params y cuerpo body vacíos.
    req = { params: {}, body: {} };

    // Inicializa res con funciones falsas para simular status() y json().
    res = {
      // mockReturnThis() permite encadenar métodos como res.status(200).json(...).
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
  });

  // Agrupa específicamente las pruebas para la función activarProducto.
  describe('activarProducto', () => {

    // CASO 1: Éxito al reactivar el producto.
    test('Debe reactivar el producto exitosamente', () => {
      // Simula que el cliente envió el ID 5 en la URL /productos/activar/5
      req.params = { id: '5' };
      console.log('\n[TEST] activarProducto - Éxito');
      console.log('  Input: req.params =', JSON.stringify(req.params));

      try {
        // Define qué debe responder la consulta SQL falsa cuando sea llamada.
        connection.query.mockImplementation((sql, params, callback) => {
          // Verifica que se le pase el ID 5 a la consulta SQL.
          expect(params).toEqual(['5']);
          // Ejecuta el callback respondiendo que se modificó 1 fila sin errores.
          callback(null, { affectedRows: 1 });
        });

        // Ejecuta la función del controlador pasándole nuestros req y res simulados.
        productosController.activarProducto(req, res);
        console.log('  Variables evaluadas -> req:', JSON.stringify(req), '| res.status:', JSON.stringify(res.status.mock.calls), '| res.json:', JSON.stringify(res.json.mock.calls), '| dbCalls:', connection.query.mock.calls.length);

        // Verifica que el controlador haya respondido con el JSON esperado.
        expect(res.json).toHaveBeenCalledWith({ mensaje: 'Producto reactivado' });
        console.log('  ✓ POSITIVO - Output: res.json =', JSON.stringify({ mensaje: 'Producto reactivado' }));
      } catch (error) {
        console.log('  ✗ NEGATIVO - Expected: res.json =', JSON.stringify({ mensaje: 'Producto reactivado' }));
        console.log('  ✗ NEGATIVO - Error:', error.message);
        throw error;
      }
    });

    // CASO 2: El producto no existe en la base de datos.
    test('Debe retornar 404 si el producto a reactivar no existe', () => {
      // Simula que se envía un ID que no existe 99.
      req.params = { id: '99' };
      console.log('\n[TEST] activarProducto - No existe (404)');
      console.log('  Input: req.params =', JSON.stringify(req.params));

      try {
        // Define el comportamiento de la consulta SQL falsa.
        connection.query.mockImplementation((sql, params, callback) => {
          // Responde que 0 filas fueron modificadas el producto no se encontró.
          callback(null, { affectedRows: 0 });
        });

        // Ejecuta la función del controlador.
        productosController.activarProducto(req, res);
        console.log('  Variables evaluadas -> req:', JSON.stringify(req), '| res.status:', JSON.stringify(res.status.mock.calls), '| res.json:', JSON.stringify(res.json.mock.calls), '| dbCalls:', connection.query.mock.calls.length);

        // Verifica que se haya devuelto el código de estado HTTP 404 Not Found.
        expect(res.status).toHaveBeenCalledWith(404);
        // Verifica que el mensaje de error en formato JSON sea el correcto.
        expect(res.json).toHaveBeenCalledWith({ mensaje: 'Producto no existe' });
        console.log('  ✓ POSITIVO - Output: res.status(404), res.json =', JSON.stringify({ mensaje: 'Producto no existe' }));
      } catch (error) {
        console.log('  ✗ NEGATIVO - Expected: res.status(404), res.json =', JSON.stringify({ mensaje: 'Producto no existe' }));
        console.log('  ✗ NEGATIVO - Error:', error.message);
        throw error;
      }
    });

    // CASO 3: Falla del servidor / base de datos.
    test('Debe retornar 500 si falla la consulta SQL', () => {
      // Simula que se envía el ID '5'.
      req.params = { id: '5' };
      console.log('\n[TEST] activarProducto - Error BD (500)');
      console.log('  Input: req.params =', JSON.stringify(req.params));

      try {
        // Define el comportamiento de la consulta SQL falsa cuando ocurre un fallo.
        connection.query.mockImplementation((sql, params, callback) => {
          // Simula un error interno devuelto por MySQL.
          callback(new Error('Error al reactivar producto'), null);
        });

        // Ejecuta la función del controlador.
        productosController.activarProducto(req, res);
        console.log('  Variables evaluadas -> req:', JSON.stringify(req), '| res.status:', JSON.stringify(res.status.mock.calls), '| res.json:', JSON.stringify(res.json.mock.calls), '| dbCalls:', connection.query.mock.calls.length);

        // Verifica que se devuelva el código de estado HTTP 500 (Internal Server Error).
        expect(res.status).toHaveBeenCalledWith(500);
        // Verifica que la respuesta JSON contenga el texto del error.
        expect(res.json).toHaveBeenCalledWith({ error: 'Error al reactivar producto' });
        console.log('  ✓ POSITIVO - Output: res.status(500), res.json =', JSON.stringify({ error: 'Error al reactivar producto' }));
      } catch (error) {
        console.log('  ✗ NEGATIVO - Expected: res.status(500), res.json =', JSON.stringify({ error: 'Error al reactivar producto' }));
        console.log('  ✗ NEGATIVO - Error:', error.message);
        throw error;
      }
    });

  });
});