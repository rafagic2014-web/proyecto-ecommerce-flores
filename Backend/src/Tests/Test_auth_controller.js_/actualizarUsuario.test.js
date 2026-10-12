const mockQuery = jest.fn();

jest.mock("../../bd/connections.js", () => ({
  query: mockQuery,
  promise: () => ({
    query: jest.fn(),
  }),
}));

const authController = require("../../controllers/auth_controller");

describe("Pruebas Unitarias - Actualizar Usuario", () => {
  let req, res;

  beforeEach(() => {
    jest.clearAllMocks();

    req = {
      params: {
        id: "2",
      },
      body: {
        rol: "cliente",
      },
      user: {
        id: 1,
      },
    };

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
  });

  test("Debe actualizar un usuario correctamente", () => {
    mockQuery
      // UPDATE usuarios
      .mockImplementationOnce((sql, valores, callback) => {
        callback(null, { affectedRows: 1 });
      })

      // SELECT COUNT(*)
      .mockImplementationOnce((sql, valores, callback) => {
        callback(null, [{ total: 1 }]);
      });

    authController.actualizarUsuario(req, res);

    expect(res.json).toHaveBeenCalledWith({
      mensaje: "Usuario actualizado",
    });
  });
});
