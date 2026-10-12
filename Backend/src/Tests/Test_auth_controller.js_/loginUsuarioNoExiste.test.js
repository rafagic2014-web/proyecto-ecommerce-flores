// Mock primero
const mockQuery = jest.fn();

jest.mock("../../bd/connections.js", () => ({
  promise: () => ({
    query: mockQuery,
  }),
}));

// Luego se importa el controlador
const authController = require("../../controllers/auth_controller");

describe("Pruebas Unitarias - Login Usuario No Existe", () => {
  let req, res;

  beforeEach(() => {
    jest.clearAllMocks();

    req = {
      body: {
        email: "correo@test.com",
        password: "123456",
      },
    };

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
  });

  test("Debe retornar 404 cuando el usuario no existe", async () => {
    mockQuery.mockResolvedValue([[]]);

    await authController.login(req, res);

    expect(res.status).toHaveBeenCalledWith(404);

    expect(res.json).toHaveBeenCalledWith({
      mensaje: "Usuario no encontrado",
    });
  });
});
