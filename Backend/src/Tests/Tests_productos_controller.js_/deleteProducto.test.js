// Importa las funciones del controlador de productos para ejecutarlas en el test.
const productosController = require('../../controllers/productos_controller'); 

// Importa el módulo de la base de datos para poder simularlo mockearlo.
const connection = require('../../bd/connections');

// Reemplaza la base de datos real con una función falsa para la consulta query.
jest.mock('../../bd/connections.js', () => ({
  query: jest.fn()
}));

// Agrupa las pruebas de este archivo bajo el título Pruebas Unitarias - Borrar Producto.
describe('Pruebas Unitarias - Borrar Producto', () => {
  // Declara las variables que simularán los objetos de petición req y respuesta res de Express.
  let req, res;

  // Se ejecuta automáticamente antes de cada prueba individual.
  beforeEach(() => {
    // Borra el historial de llamadas previas de las funciones simuladas.
    jest.clearAllMocks();

    // Inicializa req con objetos vacíos para params y body.
    req = { params: {}, body: {} };

    // Configura res con espías de Jest para verificar cómo responde la API.
    res = {
      // mockReturnThis permite encadenar métodos como res.status(404).json(...).
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
  });

  // Bloque secundario para agrupar únicamente las pruebas de la función deleteProducto.
  describe('deleteProducto', () => {

    // CASO 1: Desactivación exitosa del producto eliminación lógica / soft delete.
    test('Debe desactivar el producto exitosamente (soft delete)', () => {
      // Simula que el cliente envió el ID '5' en los parámetros de la URL /productos/5.
      req.params = { id: '5' };
      console.log('\n[TEST] deleteProducto - Éxito (soft delete)');
      console.log('  Input: req.params =', JSON.stringify(req.params));

      try {
        // Define qué debe responder la consulta SQL falsa.
        connection.query.mockImplementation((sql, params, callback) => {
          // Confirma que el parámetro enviado a la BD sea exactamente el ID '5'.
          expect(params).toEqual(['5']);
          // Responde con un callback exitoso indicando que se modificó 1 fila.
          callback(null, { affectedRows: 1 });
        });

        // Llama a la función del controlador pasando los objetos simulados.
        productosController.deleteProducto(req, res);
        console.log('  Variables evaluadas -> req:', JSON.stringify(req), '| res.status:', JSON.stringify(res.status.mock.calls), '| res.json:', JSON.stringify(res.json.mock.calls), '| dbCalls:', connection.query.mock.calls.length);

        // Verifica que el servidor devuelva la confirmación de la desactivación.
        expect(res.json).toHaveBeenCalledWith({ mensaje: 'Producto desactivado' });
        console.log('  ✓ POSITIVO - Output: res.json =', JSON.stringify({ mensaje: 'Producto desactivado' }));
      } catch (error) {
        console.log('  ✗ NEGATIVO - Expected: res.json =', JSON.stringify({ mensaje: 'Producto desactivado' }));
        console.log('  ✗ NEGATIVO - Error:', error.message);
        throw error;
      }
    });

    // CASO 2: El producto no existe en la base de datos.
    test('Debe retornar 404 si el producto a eliminar no existe', () => {
      // Simula el envío de un ID inexistente '99'.
      req.params = { id: '99' };
      console.log('\n[TEST] deleteProducto - No existe (404)');
      console.log('  Input: req.params =', JSON.stringify(req.params));

      try {
        // Configura la respuesta de la base de datos falsa.
        connection.query.mockImplementation((sql, params, callback) => {
          // Indica que no se modificó ninguna fila affectedRows: 0.
          callback(null, { affectedRows: 0 });
        });

        // Ejecuta el controlador.
        productosController.deleteProducto(req, res);
        console.log('  Variables evaluadas -> req:', JSON.stringify(req), '| res.status:', JSON.stringify(res.status.mock.calls), '| res.json:', JSON.stringify(res.json.mock.calls), '| dbCalls:', connection.query.mock.calls.length);

        // Comprueba que se retorne el código de estado HTTP 404 Not Found.
        expect(res.status).toHaveBeenCalledWith(404);
        // Comprueba que el JSON devuelva el mensaje indicando que no existe.
        expect(res.json).toHaveBeenCalledWith({ mensaje: 'Producto no existe' });
        console.log('  ✓ POSITIVO - Output: res.status(404), res.json =', JSON.stringify({ mensaje: 'Producto no existe' }));
      } catch (error) {
        console.log('  ✗ NEGATIVO - Expected: res.status(404), res.json =', JSON.stringify({ mensaje: 'Producto no existe' }));
        console.log('  ✗ NEGATIVO - Error:', error.message);
        throw error;
      }
    });

    // CASO 3: Ocurre un fallo en la base de datos.
    test('Debe retornar 500 si falla la consulta SQL', () => {
      // Simula el envío del ID '5.
      req.params = { id: '5' };
      console.log('\n[TEST] deleteProducto - Error BD (500)');
      console.log('  Input: req.params =', JSON.stringify(req.params));

      try {
        // Simula un error devuelto por la base de datos.
        connection.query.mockImplementation((sql, params, callback) => {
          callback(new Error('Error de desactivación'), null);
        });

        // Ejecuta la función del controlador.
        productosController.deleteProducto(req, res);
        console.log('  Variables evaluadas -> req:', JSON.stringify(req), '| res.status:', JSON.stringify(res.status.mock.calls), '| res.json:', JSON.stringify(res.json.mock.calls), '| dbCalls:', connection.query.mock.calls.length);

        // Verifica que la respuesta tenga el código HTTP 500 (Internal Server Error).
        expect(res.status).toHaveBeenCalledWith(500);
        // Verifica que el JSON entregue el objeto de error capturado.
        expect(res.json).toHaveBeenCalledWith({ error: 'Error de desactivación' });
        console.log('  ✓ POSITIVO - Output: res.status(500), res.json =', JSON.stringify({ error: 'Error de desactivación' }));
      } catch (error) {
        console.log('  ✗ NEGATIVO - Expected: res.status(500), res.json =', JSON.stringify({ error: 'Error de desactivación' }));
        console.log('  ✗ NEGATIVO - Error:', error.message);
        throw error;
      }
    });

  });
});