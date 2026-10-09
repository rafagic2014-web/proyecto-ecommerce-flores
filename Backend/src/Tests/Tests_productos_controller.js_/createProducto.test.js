// Importa las funciones del controlador de productos para ejecutarlas durante los tests.
const productosController = require('../../controllers/productos_controller'); 

// Importa el archivo de conexión a la base de datos para simularlo.
const connection = require('../../bd/connections');

// Reemplaza la base de datos real con una función falsa mock para query.
jest.mock('../../bd/connections.js', () => ({
  query: jest.fn()
}));

// Agrupa las pruebas de este archivo bajo el título Pruebas Unitarias - Creación de Producto.
describe('Pruebas Unitarias - Creación de Producto', () => {
  // Declara las variables para simular la petición req y respuesta res de Express.
  let req, res;

  // Se ejecuta automáticamente antes de cada test individual.
  beforeEach(() => {
    // Limpia el historial de llamadas previas de las funciones falsas.
    jest.clearAllMocks();

    // Inicializa req con objetos vacíos para params y body.
    req = { params: {}, body: {} };

    // Prepara res con espías de Jest para validar las respuestas del servidor.
    res = {
      // mockReturnThis permite encadenar métodos: res.status(400).json(...)
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
  });

  // Bloque secundario para agrupar únicamente los casos de la función createProducto.
  describe('createProducto', () => {

    // CASO 1: Validación cuando falta el campo nombre.
    test('Debe retornar 400 si falta el nombre', () => {
      // Simula el envío de datos en el cuerpo (body) omitiendo el nombre.
      req.body = { descripcion: 'Mouse óptico', precio: 15 };
      console.log('\n[TEST] createProducto - Falta nombre (400)');
      console.log('  Input: req.body =', JSON.stringify(req.body));

      try {
        // Llama a la función del controlador con los datos falsos.
        productosController.createProducto(req, res);
        console.log('  Variables evaluadas -> req:', JSON.stringify(req), '| res.status:', JSON.stringify(res.status.mock.calls), '| res.json:', JSON.stringify(res.json.mock.calls), '| dbCalls:', connection.query.mock.calls.length);

        // Verifica que retorne un estado HTTP 400 Bad Request.
        expect(res.status).toHaveBeenCalledWith(400);
        // Verifica el mensaje de error en la respuesta JSON.
        expect(res.json).toHaveBeenCalledWith({ mensaje: 'Nombre y precio son obligatorios' });
        // Asegura que NO se haya intentado hacer ninguna consulta a la base de datos.
        expect(connection.query).not.toHaveBeenCalled();
        console.log('  ✓ POSITIVO - Output: res.status(400), res.json =', JSON.stringify({ mensaje: 'Nombre y precio son obligatorios' }));
      } catch (error) {
        console.log('  ✗ NEGATIVO - Expected: res.status(400), res.json =', JSON.stringify({ mensaje: 'Nombre y precio son obligatorios' }));
        console.log('  ✗ NEGATIVO - Error:', error.message);
        throw error;
      }
    });

    // CASO 2: Validación cuando falta el campo precio.
    test('Debe retornar 400 si falta el precio', () => {
      // Simula el envío de datos en el body omitiendo el precio.
      req.body = { nombre: 'Mouse óptico', descripcion: 'Inalámbrico' };
      console.log('\n[TEST] createProducto - Falta precio (400)');
      console.log('  Input: req.body =', JSON.stringify(req.body));

      try {
        // Ejecuta la función del controlador.
        productosController.createProducto(req, res);
        console.log('  Variables evaluadas -> req:', JSON.stringify(req), '| res.status:', JSON.stringify(res.status.mock.calls), '| res.json:', JSON.stringify(res.json.mock.calls), '| dbCalls:', connection.query.mock.calls.length);

        // Verifica que devuelva el código HTTP 400.
        expect(res.status).toHaveBeenCalledWith(400);
        // Confirma que el mensaje indique la falta de campos obligatorios.
        expect(res.json).toHaveBeenCalledWith({ mensaje: 'Nombre y precio son obligatorios' });
        // Confirma que la base de datos no fue consultada.
        expect(connection.query).not.toHaveBeenCalled();
        console.log('  ✓ POSITIVO - Output: res.status(400), res.json =', JSON.stringify({ mensaje: 'Nombre y precio son obligatorios' }));
      } catch (error) {
        console.log('  ✗ NEGATIVO - Expected: res.status(400), res.json =', JSON.stringify({ mensaje: 'Nombre y precio son obligatorios' }));
        console.log('  ✗ NEGATIVO - Error:', error.message);
        throw error;
      }
    });

    // CASO 3: Creación exitosa del producto.
    test('Debe crear el producto correctamente cuando los datos son válidos', () => {
      // Simula un body completo con todos los campos necesarios.
      req.body = {
        nombre: 'Monitor 24"',
        descripcion: 'Full HD',
        precio: 150,
        stock: 10,
        imagen: 'monitor.jpg',
        categoria_id: 2
      };
      console.log('\n[TEST] createProducto - Éxito');
      console.log('  Input: req.body =', JSON.stringify(req.body));

      try {
        // Define el comportamiento esperado de la consulta SQL falsa.
        connection.query.mockImplementation((sql, params, callback) => {
          // Comprueba que los parámetros enviados a la BD coincidan exactamente con el body.
          expect(params).toEqual(['Monitor 24"', 'Full HD', 150, 10, 'monitor.jpg', 2]);
          // Ejecuta el callback simulando un registro guardado (insertId: 1) sin errores.
          callback(null, { insertId: 1 });
        });

        // Ejecuta el controlador.
        productosController.createProducto(req, res);
        console.log('  Variables evaluadas -> req:', JSON.stringify(req), '| res.status:', JSON.stringify(res.status.mock.calls), '| res.json:', JSON.stringify(res.json.mock.calls), '| dbCalls:', connection.query.mock.calls.length);

        // Confirma que el servidor responda confirmando la creación.
        expect(res.json).toHaveBeenCalledWith({ mensaje: 'Producto creado' });
        console.log('  ✓ POSITIVO - Output: res.json =', JSON.stringify({ mensaje: 'Producto creado' }));
      } catch (error) {
        console.log('  ✗ NEGATIVO - Expected: res.json =', JSON.stringify({ mensaje: 'Producto creado' }));
        console.log('  ✗ NEGATIVO - Error:', error.message);
        throw error;
      }
    });

    // CASO 4: Fallo en la inserción SQL por error en la BD.
    test('Debe retornar 500 si la inserción en BD falla', () => {
      // Prepara un body válido con los datos mínimos requeridos.
      req.body = { nombre: 'Silla Gamer', precio: 200 };
      console.log('\n[TEST] createProducto - Error BD (500)');
      console.log('  Input: req.body =', JSON.stringify(req.body));

      try {
        // Simula un error proveniente del motor de base de datos.
        connection.query.mockImplementation((sql, params, callback) => {
          callback(new Error('Error de inserción'), null);
        });

        // Llama a la función a probar.
        productosController.createProducto(req, res);
        console.log('  Variables evaluadas -> req:', JSON.stringify(req), '| res.status:', JSON.stringify(res.status.mock.calls), '| res.json:', JSON.stringify(res.json.mock.calls), '| dbCalls:', connection.query.mock.calls.length);

        // Verifica que responda con el código HTTP 500 Internal Server Error.
        expect(res.status).toHaveBeenCalledWith(500);
        // Verifica que la respuesta devuelva el mensaje de error capturado.
        expect(res.json).toHaveBeenCalledWith({ error: 'Error de inserción' });
        console.log('  ✓ POSITIVO - Output: res.status(500), res.json =', JSON.stringify({ error: 'Error de inserción' }));
      } catch (error) {
        console.log('  ✗ NEGATIVO - Expected: res.status(500), res.json =', JSON.stringify({ error: 'Error de inserción' }));
        console.log('  ✗ NEGATIVO - Error:', error.message);
        throw error;
      }
    });

  });
});