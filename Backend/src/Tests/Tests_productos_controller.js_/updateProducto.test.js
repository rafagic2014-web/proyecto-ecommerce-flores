// Importa las funciones del controlador de productos para probar su lógica.
const productosController = require('../../controllers/productos_controller'); 

// Importa el archivo de conexión a la base de datos para simularlo.
const connection = require('../../bd/connections');

// Reemplaza la conexión real a la base de datos por un objeto falso (mock) con 'query'.
jest.mock('../../bd/connections.js', () => ({
  query: jest.fn()
}));

// Agrupa las pruebas relacionadas con la actualización de datos de un producto.
describe('Pruebas Unitarias - Actualizar Producto', () => {
  // Declara las variables para los objetos simulados de petición (req) y respuesta (res).
  let req, res;

  // Se ejecuta automáticamente antes de cada test individual.
  beforeEach(() => {
    // Borra los registros de ejecuciones previas de los mocks.
    jest.clearAllMocks();

    // Inicializa 'req' con objetos vacíos para parámetros de URL y cuerpo.
    req = { params: {}, body: {} };

    // Configura 'res' con espías de Jest para rastrear el código de estado y la respuesta JSON.
    res = {
      // mockReturnThis permite encadenar métodos como res.status(404).json(...).
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
  });

  // Bloque contenedor para las pruebas específicas de updateProducto.
  describe('updateProducto', () => {

    // CASO ESPECIAL: Manejo de categorías vacías convirtiéndolas a NULL en SQL.
    test('Debe convertir categoria_id vacía ("") o undefined a null', () => {
      // Simula el ID '1' en la URL y un campo de categoría vacío en el cuerpo de la petición.
      req.params = { id: '1' };
      req.body = { nombre: 'Laptop', categoria_id: '' };
      console.log('\n[TEST] updateProducto - categoria_id vacío a null');
      console.log('  Input: req.params =', JSON.stringify(req.params));
      console.log('  Input: req.body =', JSON.stringify(req.body));

      try {
        // Configura la respuesta de la base de datos falsa.
        connection.query.mockImplementation((sql, params, callback) => {
          // Valida que el sexto parámetro (categoría) se haya transformado en 'null' antes de enviar a la BD.
          expect(params[5]).toBeNull(); 
          // Simula la actualización exitosa de 1 fila.
          callback(null, { affectedRows: 1 });
        });

        // Ejecuta la función del controlador.
        productosController.updateProducto(req, res);
        console.log('  Variables evaluadas -> req:', JSON.stringify(req), '| res.status:', JSON.stringify(res.status.mock.calls), '| res.json:', JSON.stringify(res.json.mock.calls), '| dbCalls:', connection.query.mock.calls.length);

        // Verifica que retorne el mensaje de éxito en formato JSON.
        expect(res.json).toHaveBeenCalledWith({ mensaje: 'Producto actualizado' });
        console.log('  ✓ POSITIVO - Output: res.json =', JSON.stringify({ mensaje: 'Producto actualizado' }));
      } catch (error) {
        console.log('  ✗ NEGATIVO - Expected: res.json =', JSON.stringify({ mensaje: 'Producto actualizado' }));
        console.log('  ✗ NEGATIVO - Error:', error.message);
        throw error;
      }
    });

    // CASO DE ÉXITO: Actualización normal cuando los datos son válidos y el producto existe.
    test('Debe actualizar el producto correctamente cuando existe', () => {
      // Simula el ID del producto y los datos actualizados a enviar.
      req.params = { id: '1' };
      req.body = { nombre: 'Laptop Pro', precio: 1200, categoria_id: 3 };
      console.log('\n[TEST] updateProducto - Éxito');
      console.log('  Input: req.params =', JSON.stringify(req.params));
      console.log('  Input: req.body =', JSON.stringify(req.body));

      try {
        // Define la respuesta de la consulta SQL como exitosa.
        connection.query.mockImplementation((sql, params, callback) => {
          callback(null, { affectedRows: 1 });
        });

        // Ejecuta el controlador.
        productosController.updateProducto(req, res);
        console.log('  Variables evaluadas -> req:', JSON.stringify(req), '| res.status:', JSON.stringify(res.status.mock.calls), '| res.json:', JSON.stringify(res.json.mock.calls), '| dbCalls:', connection.query.mock.calls.length);

        // Confirma que el servidor devuelva el mensaje de actualización.
        expect(res.json).toHaveBeenCalledWith({ mensaje: 'Producto actualizado' });
        console.log('  ✓ POSITIVO - Output: res.json =', JSON.stringify({ mensaje: 'Producto actualizado' }));
      } catch (error) {
        console.log('  ✗ NEGATIVO - Expected: res.json =', JSON.stringify({ mensaje: 'Producto actualizado' }));
        console.log('  ✗ NEGATIVO - Error:', error.message);
        throw error;
      }
    });

    // CASO PRODUCTO NO ENCONTRADO: AffectedRows es 0 en MySQL.
    test('Debe retornar 404 si el producto no existe (affectedRows === 0)', () => {
      // Simula un ID inexistente ('99').
      req.params = { id: '99' };
      req.body = { nombre: 'Inexistente' };
      console.log('\n[TEST] updateProducto - No existe (404)');
      console.log('  Input: req.params =', JSON.stringify(req.params));
      console.log('  Input: req.body =', JSON.stringify(req.body));

      try {
        // Simula que la BD no encontró el registro para modificar (0 filas afectadas).
        connection.query.mockImplementation((sql, params, callback) => {
          callback(null, { affectedRows: 0 });
        });

        // Ejecuta la función del controlador.
        productosController.updateProducto(req, res);
        console.log('  Variables evaluadas -> req:', JSON.stringify(req), '| res.status:', JSON.stringify(res.status.mock.calls), '| res.json:', JSON.stringify(res.json.mock.calls), '| dbCalls:', connection.query.mock.calls.length);

        // Comprueba que el estado HTTP sea 404 (Not Found).
        expect(res.status).toHaveBeenCalledWith(404);
        // Comprueba que la respuesta informe la no existencia del producto.
        expect(res.json).toHaveBeenCalledWith({ mensaje: 'Producto no existe' });
        console.log('  ✓ POSITIVO - Output: res.status(404), res.json =', JSON.stringify({ mensaje: 'Producto no existe' }));
      } catch (error) {
        console.log('  ✗ NEGATIVO - Expected: res.status(404), res.json =', JSON.stringify({ mensaje: 'Producto no existe' }));
        console.log('  ✗ NEGATIVO - Error:', error.message);
        throw error;
      }
    });

    // CASO DE ERROR DE BD: Falla al ejecutar la consulta SQL.
    test('Debe retornar 500 ante fallo en la BD', () => {
      // Simula el envío de datos sobre un ID válido.
      req.params = { id: '1' };
      req.body = { nombre: 'Laptop Pro' };
      console.log('\n[TEST] updateProducto - Error BD (500)');
      console.log('  Input: req.params =', JSON.stringify(req.params));
      console.log('  Input: req.body =', JSON.stringify(req.body));

      try {
        // Simula un error interno devuelto por MySQL.
        connection.query.mockImplementation((sql, params, callback) => {
          callback(new Error('Error al actualizar'), null);
        });

        // Ejecuta la función a probar.
        productosController.updateProducto(req, res);
        console.log('  Variables evaluadas -> req:', JSON.stringify(req), '| res.status:', JSON.stringify(res.status.mock.calls), '| res.json:', JSON.stringify(res.json.mock.calls), '| dbCalls:', connection.query.mock.calls.length);

        // Verifica el código HTTP 500 (Internal Server Error).
        expect(res.status).toHaveBeenCalledWith(500);
        // Verifica que el JSON entregue el objeto de error capturado.
        expect(res.json).toHaveBeenCalledWith({ error: 'Error al actualizar' });
        console.log('  ✓ POSITIVO - Output: res.status(500), res.json =', JSON.stringify({ error: 'Error al actualizar' }));
      } catch (error) {
        console.log('  ✗ NEGATIVO - Expected: res.status(500), res.json =', JSON.stringify({ error: 'Error al actualizar' }));
        console.log('  ✗ NEGATIVO - Error:', error.message);
        throw error;
      }
    });

  });
});