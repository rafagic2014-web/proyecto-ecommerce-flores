// Importa las funciones del controlador de productos a probar.
const productosController = require('../../controllers/productos_controller'); 

// Importa el archivo de conexión a la base de datos para simularlo.
const connection = require('../../bd/connections');

// Reemplaza la conexión real a la base de datos con una función falsa (mock) para 'query'.
jest.mock('../../bd/connections.js', () => ({
  query: jest.fn()
}));

// Agrupa las pruebas enfocadas en la consulta general de todos los productos.
describe('Pruebas Unitarias - Obtener Todos los Productos', () => {
  // Declara las variables para simular la petición (req) y respuesta (res) de Express.
  let req, res;

  // Se ejecuta automáticamente antes de cada prueba individual.
  beforeEach(() => {
    // Borra el historial de ejecuciones previas de los mocks.
    jest.clearAllMocks();

    // Inicializa 'req' con objetos vacíos para params y body.
    req = { params: {}, body: {} };

    // Configura 'res' con espías de Jest para rastrear el uso de status() y json().
    res = {
      // mockReturnThis() permite encadenar métodos como res.status(500).json(...).
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
  });

  // Bloque contenedor para las pruebas de la función getTodosProductos.
  describe('getTodosProductos', () => {

    // CASO DE ÉXITO: Retorna la lista completa sin filtrar por estado (activos e inactivos).
    test('Debe retornar todos los productos (activos e inactivos)', () => {
      // Lista de productos simulados incluyendo tanto un producto activo como uno inactivo.
      const mockProductos = [
        { id: 1, nombre: 'Producto A', estado_activo: true },
        { id: 2, nombre: 'Producto B', estado_activo: false }
      ];
      console.log('\n[TEST] getTodosProductos - Éxito');
      console.log('  Mock DB response:', JSON.stringify(mockProductos));

      try {
        // Define que la consulta SQL falsa devuelva el listado completo sin errores.
        connection.query.mockImplementation((sql, callback) => {
          callback(null, mockProductos);
        });

        // Llama a la función del controlador pasando los objetos simulados.
        productosController.getTodosProductos(req, res);
        console.log('  Variables evaluadas -> req:', JSON.stringify(req), '| res.status:', JSON.stringify(res.status.mock.calls), '| res.json:', JSON.stringify(res.json.mock.calls), '| dbCalls:', connection.query.mock.calls.length);

        // Comprueba que la consulta SQL fue ejecutada enviando una cadena SQL y un callback.
        expect(connection.query).toHaveBeenCalledWith(expect.any(String), expect.any(Function));
        // Comprueba que res.json entregó la lista completa simulada.
        expect(res.json).toHaveBeenCalledWith(mockProductos);
        console.log('  ✓ POSITIVO - Output: res.json =', JSON.stringify(mockProductos));
      } catch (error) {
        console.log('  ✗ NEGATIVO - Expected: res.json =', JSON.stringify(mockProductos));
        console.log('  ✗ NEGATIVO - Error:', error.message);
        throw error;
      }
    });

    // CASO DE ERROR: Fallo en la base de datos al realizar la consulta.
    test('Debe retornar 500 si la base de datos falla', () => {
      // Configura la base de datos falsa para simular una falla en la consulta SQL.
      connection.query.mockImplementation((sql, callback) => {
        callback(new Error('Fallo en la consulta SQL'), null);
      });
      console.log('\n[TEST] getTodosProductos - Error BD (500)');
      console.log('  Mock DB error: Fallo en la consulta SQL');

      try {
        // Ejecuta la función del controlador.
        productosController.getTodosProductos(req, res);
        console.log('  Variables evaluadas -> req:', JSON.stringify(req), '| res.status:', JSON.stringify(res.status.mock.calls), '| res.json:', JSON.stringify(res.json.mock.calls), '| dbCalls:', connection.query.mock.calls.length);

        // Verifica que retorne el código de estado HTTP 500 (Internal Server Error).
        expect(res.status).toHaveBeenCalledWith(500);
        // Verifica que la respuesta JSON devuelva el objeto con el mensaje del error capturado.
        expect(res.json).toHaveBeenCalledWith({ error: 'Fallo en la consulta SQL' });
        console.log('  ✓ POSITIVO - Output: res.status(500), res.json =', JSON.stringify({ error: 'Fallo en la consulta SQL' }));
      } catch (error) {
        console.log('  ✗ NEGATIVO - Expected: res.status(500), res.json =', JSON.stringify({ error: 'Fallo en la consulta SQL' }));
        console.log('  ✗ NEGATIVO - Error:', error.message);
        throw error;
      }
    });

  });
});