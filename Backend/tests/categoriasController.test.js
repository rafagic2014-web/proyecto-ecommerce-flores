
const connection = require('../src/bd/connections');

jest.mock('../src/bd/connections', () => ({
  query: jest.fn()
}));

const {
  getCategorias,
  createCategoria,
  deleteCategoria
} = require('../src/controllers/categorias_controller');

describe('PRUEBAS UNITARIAS - CATEGORIAS_CONTROLLER.JS', () => {
  let req;
  let res;

  beforeEach(() => {
    jest.clearAllMocks();

    req = {
      body: {},
      params: {}
    };

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis()
    };
  });

  function evidencia(nombre) {
    console.log('\n[TEST] ' + nombre);
    console.log('Input:', JSON.stringify(req));
    console.log('Variables evaluadas:');
    console.log('res.status:', JSON.stringify(res.status.mock.calls));
    console.log('res.json:', JSON.stringify(res.json.mock.calls));
    console.log('dbCalls:', connection.query.mock.calls.length);
  }

  // PRUEBA 1: OBTENER CATEGORÍAS
  test('QA-01: Obtener categorías activas', () => {
    const categorias = [
      { id: 1, nombre: 'Ramos', estado_activo: 1 },
      { id: 2, nombre: 'Flores', estado_activo: 1 }
    ];

    connection.query.mockImplementation((sql, callback) => {
      callback(null, categorias);
    });

    getCategorias(req, res);
    evidencia('getCategorias - Consulta exitosa');

    expect(res.json).toHaveBeenCalledWith(categorias);
    expect(res.status).not.toHaveBeenCalled();
    expect(connection.query).toHaveBeenCalledTimes(1);
    expect(connection.query.mock.calls[0][0])
      .toMatch(/estado_activo\s*=\s*1/);

    console.log('✓ PASS - Categorías activas obtenidas');
  });

  // PRUEBA 2: ERROR DE BASE DE DATOS
  test('QA-02: Error al consultar categorías', () => {
    connection.query.mockImplementation((sql, callback) => {
      callback(new Error('Error SQL'), null);
    });

    getCategorias(req, res);
    evidencia('getCategorias - Error de base de datos');

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      error: 'Error SQL'
    });

    console.log('✓ PASS - Error 500 controlado');
  });

  // PRUEBA 3: CREAR CATEGORÍA
  test('QA-03: Crear categoría válida', () => {
    req.body = {
      nombre: 'Orquídeas',
      estado_activo: 1
    };

    connection.query.mockImplementation((sql, valores, callback) => {
      callback(null, { affectedRows: 1 });
    });

    createCategoria(req, res);
    evidencia('createCategoria - Creación exitosa');

    expect(connection.query).toHaveBeenCalledWith(
      expect.stringContaining('INSERT INTO categorias'),
      ['Orquídeas', 1],
      expect.any(Function)
    );
    expect(res.json).toHaveBeenCalledWith({
      mensaje: 'Categoría creada'
    });
    expect(res.status).not.toHaveBeenCalled();

    console.log('✓ PASS - Categoría creada correctamente');
  });

  // PRUEBA 4: NOMBRE OBLIGATORIO
  test('QA-04: Crear categoría sin nombre', () => {
    req.body = {
      estado_activo: 1
    };

    createCategoria(req, res);
    evidencia('createCategoria - Nombre obligatorio');

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      mensaje: 'El nombre es obligatorio'
    });
    expect(connection.query).not.toHaveBeenCalled();

    console.log('✓ PASS - Validación de nombre obligatorio');
  });

  // PRUEBA 5: CATEGORÍA INEXISTENTE
  test('QA-05: Desactivar categoría inexistente', () => {
    req.params = {
      id: '9999'
    };

    connection.query.mockImplementation((sql, valores, callback) => {
      callback(null, { affectedRows: 0 });
    });

    deleteCategoria(req, res);
    evidencia('deleteCategoria - Categoría inexistente');

    expect(connection.query).toHaveBeenCalledWith(
      expect.stringContaining('UPDATE categorias'),
      ['9999'],
      expect.any(Function)
    );
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      mensaje: 'Categoría no existe'
    });

    console.log('✓ PASS - Categoría inexistente controlada');
  });
});
