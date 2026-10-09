// Importa las funciones del controlador de productos para ejecutarlas durante la prueba.
const productosController = require('../../controllers/productos_controller'); 

// Importa el archivo de conexión a la base de datos para simularlo.
const connection = require('../../bd/connections');

// Reemplaza la conexión real a la base de datos por un módulo falso mock con query.
jest.mock('../../bd/connections.js', () => ({
  query: jest.fn()
}));

// Agrupa las pruebas enfocadas en filtrar productos por categoría.
describe('Pruebas Unitarias - Obtener Productos por Categoría', () => {
  // Declara las variables para los objetos simulados de petición (req) y respuesta (res).
  let req, res;

  // Se ejecuta automáticamente antes de cada prueba individual.
  beforeEach(() => {
    // Borra los registros de ejecuciones previas de los mocks de Jest.
    jest.clearAllMocks();

    // Inicializa 'req' con objetos vacíos para parámetros y cuerpo.
    req = { params: {}, body: {} };

    // Configura 'res' con espías de Jest para rastrear el código de estado y la respuesta JSON.
    res = {
      // mockReturnThis permite encadenar métodos como res.status(500).json(...).
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
  });

  // Bloque contenedor para las pruebas específicas de getProductosPorCategoria.
  describe('getProductosPorCategoria', () => {

    // CASO DE ÉXITO: Filtra y retorna los productos que pertenecen a la categoría enviada.
    test('Debe filtrar productos pasando categoria_id correctamente', () => {
      // Simula que se recibe el id de categoría '5' en la URL (/productos/categoria/5).
      req.params = { categoria_id: '5' };
      
      // Lista de productos simulados que devolvería la base de datos para esa categoría.
      const mockProductos = [{ id: 10, nombre: 'Teclado', categoria_id: 5 }];
      console.log('\n[TEST] getProductosPorCategoria - Éxito');
      console.log('  Input: req.params =', JSON.stringify(req.params));
      console.log('  Mock DB response:', JSON.stringify(mockProductos));

      try {
        // Define cómo responderá la consulta SQL falsa.
        connection.query.mockImplementation((sql, params, callback) => {
          // Verifica que el id de categoría ['5'] se pase adecuadamente como parámetro SQL.
          expect(params).toEqual(['5']);
          // Retorna la lista simulada sin ningún error (null).
          callback(null, mockProductos);
        });

        // Llama a la función del controlador pasando los objetos simulados.
        productosController.getProductosPorCategoria(req, res);
        console.log('  Variables evaluadas -> req:', JSON.stringify(req), '| res.status:', JSON.stringify(res.status.mock.calls), '| res.json:', JSON.stringify(res.json.mock.calls), '| dbCalls:', connection.query.mock.calls.length);

        // Confirma que se envíe la lista de productos como respuesta JSON.
        expect(res.json).toHaveBeenCalledWith(mockProductos);
        console.log('  ✓ POSITIVO - Output: res.json =', JSON.stringify(mockProductos));
      } catch (error) {
        console.log('  ✗ NEGATIVO - Expected: res.json =', JSON.stringify(mockProductos));
        console.log('  ✗ NEGATIVO - Error:', error.message);
        throw error;
      }
    });

    // CASO DE ERROR DE BD: Falla en la ejecución de la consulta en MySQL.
    test('Debe retornar 500 si falla la consulta por categoría', () => {
      // Simula el parámetro de URL con categoría '5'.
      req.params = { categoria_id: '5' };
      console.log('\n[TEST] getProductosPorCategoria - Error BD (500)');
      console.log('  Input: req.params =', JSON.stringify(req.params));
      console.log('  Mock DB error: Error al filtrar por categoría');

      try {
        // Simula una falla devuelta por el driver de la base de datos.
        connection.query.mockImplementation((sql, params, callback) => {
          callback(new Error('Error al filtrar por categoría'), null);
        });

        // Ejecuta la función del controlador.
        productosController.getProductosPorCategoria(req, res);
        console.log('  Variables evaluadas -> req:', JSON.stringify(req), '| res.status:', JSON.stringify(res.status.mock.calls), '| res.json:', JSON.stringify(res.json.mock.calls), '| dbCalls:', connection.query.mock.calls.length);

        // Comprueba que la respuesta devuelva el código HTTP 500 (Internal Server Error).
        expect(res.status).toHaveBeenCalledWith(500);
        // Comprueba que el mensaje de error capturado sea enviado en formato JSON.
        expect(res.json).toHaveBeenCalledWith({ error: 'Error al filtrar por categoría' });
        console.log('  ✓ POSITIVO - Output: res.status(500), res.json =', JSON.stringify({ error: 'Error al filtrar por categoría' }));
      } catch (error) {
        console.log('  ✗ NEGATIVO - Expected: res.status(500), res.json =', JSON.stringify({ error: 'Error al filtrar por categoría' }));
        console.log('  ✗ NEGATIVO - Error:', error.message);
        throw error;
      }
    });

    // CASO SIN RESULTADOS: La categoría existe o no, pero no tiene ningún producto asignado.
    test('Debe retornar array vacío si la categoría no tiene productos', () => {
      // Simula la consulta con una categoría sin ítems ('99').
      req.params = { categoria_id: '99' };
      console.log('\n[TEST] getProductosPorCategoria - Sin productos (200)');
      console.log('  Input: req.params =', JSON.stringify(req.params));
      console.log('  Mock DB response: []');

      try {
        // Configura la base de datos para devolver un arreglo vacío sin errores.
        connection.query.mockImplementation((sql, params, callback) => {
          expect(params).toEqual(['99']);
          callback(null, []);
        });

        // Ejecuta el controlador.
        productosController.getProductosPorCategoria(req, res);
        console.log('  Variables evaluadas -> req:', JSON.stringify(req), '| res.status:', JSON.stringify(res.status.mock.calls), '| res.json:', JSON.stringify(res.json.mock.calls), '| dbCalls:', connection.query.mock.calls.length);

        // Verifica que retorne una lista vacía [] en el JSON (estado 200 por defecto).
        expect(res.json).toHaveBeenCalledWith([]);
        console.log('  ✓ POSITIVO - Output: res.json = []');
      } catch (error) {
        console.log('  ✗ NEGATIVO - Expected: res.json = []');
        console.log('  ✗ NEGATIVO - Error:', error.message);
        throw error;
      }
    });

  });
});