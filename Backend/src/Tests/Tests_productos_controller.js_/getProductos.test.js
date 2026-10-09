// Importa el controlador de productos con las funciones a probar.
const productosController = require('../../controllers/productos_controller'); 

// Importa el módulo de conexión a la base de datos para simularlo.
const connection = require('../../bd/connections');

// Reemplaza la conexión real a la base de datos por una función falsa (mock).
jest.mock('../../bd/connections.js', () => ({
  query: jest.fn()
}));

// Agrupa las pruebas de consulta para obtener productos.
describe('Pruebas Unitarias - Obtener Productos', () => {
  // Declara las variables para los objetos simulados req (petición) y res (respuesta).
  let req, res;

  // Se ejecuta automáticamente antes de cada test.
  beforeEach(() => {
    // Limpia el contador de llamadas y llamadas previas de las funciones falsas.
    jest.clearAllMocks();

    // Inicializa 'req' con objetos vacíos para params y body.
    req = { params: {}, body: {} };

    // Configura 'res' con espías para rastrear el uso de status() y json().
    res = {
      // mockReturnThis() permite encadenar métodos como res.status(500).json(...).
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
  });

  // Bloque contenedor para las pruebas de la función getProductos.
  describe('getProductos', () => {

    // CASO DE ÉXITO: Obtiene únicamente los productos activos.
    test('Debe retornar la lista de productos activos con respuesta 200', () => {
      // Crea un arreglo simulado de productos tal como los devolvería MySQL.
      const mockProductos = [
        { id: 1, nombre: 'Producto A', estado_activo: true },
        { id: 2, nombre: 'Producto B', estado_activo: true }
      ];
      console.log('\n[TEST] getProductos - Éxito');
      console.log('  Mock DB response:', JSON.stringify(mockProductos));

      try {
        // Define el comportamiento de la consulta SQL falsa devolviendo los datos sin error.
        connection.query.mockImplementation((sql, callback) => {
          callback(null, mockProductos);
        });

        // Ejecuta la función del controlador pasando los objetos simulados.
        productosController.getProductos(req, res);
        console.log('  Variables evaluadas -> req:', JSON.stringify(req), '| res.status:', JSON.stringify(res.status.mock.calls), '| res.json:', JSON.stringify(res.json.mock.calls), '| dbCalls:', connection.query.mock.calls.length);

        // Comprueba que la consulta SQL fue ejecutada enviando una cadena de texto y un callback.
        expect(connection.query).toHaveBeenCalledWith(expect.any(String), expect.any(Function));
        // Comprueba que res.json fue llamado entregando el listado simulado.
        expect(res.json).toHaveBeenCalledWith(mockProductos);
        console.log('  ✓ POSITIVO - Output: res.json =', JSON.stringify(mockProductos));
      } catch (error) {
        console.log('  ✗ NEGATIVO - Expected: res.json =', JSON.stringify(mockProductos));
        console.log('  ✗ NEGATIVO - Error:', error.message);
        throw error;
      }
    });

    // CASO DE ERROR: Falla de la base de datos.
    test('Debe retornar 500 si ocurre un error en la BD', () => {
      // Configura la base de datos falsa para simular una falla de conexión.
      connection.query.mockImplementation((sql, callback) => {
        callback(new Error('Error de conexión a BD'), null);
      });
      console.log('\n[TEST] getProductos - Error BD (500)');
      console.log('  Mock DB error: Error de conexión a BD');

      try {
        // Ejecuta el controlador.
        productosController.getProductos(req, res);
        console.log('  Variables evaluadas -> req:', JSON.stringify(req), '| res.status:', JSON.stringify(res.status.mock.calls), '| res.json:', JSON.stringify(res.json.mock.calls), '| dbCalls:', connection.query.mock.calls.length);

        // Verifica que retorne el estado HTTP 500 (Internal Server Error).
        expect(res.status).toHaveBeenCalledWith(500);
        // Verifica que la respuesta JSON contenga el objeto con el mensaje de error.
        expect(res.json).toHaveBeenCalledWith({ error: 'Error de conexión a BD' });
        console.log('  ✓ POSITIVO - Output: res.status(500), res.json =', JSON.stringify({ error: 'Error de conexión a BD' }));
      } catch (error) {
        console.log('  ✗ NEGATIVO - Expected: res.status(500), res.json =', JSON.stringify({ error: 'Error de conexión a BD' }));
        console.log('  ✗ NEGATIVO - Error:', error.message);
        throw error;
      }
    });

  });
});