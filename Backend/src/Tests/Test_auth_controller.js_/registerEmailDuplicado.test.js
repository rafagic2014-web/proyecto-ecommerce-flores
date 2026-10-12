// Mock de la consulta a BD
const mockQuery = jest.fn();

jest.mock("../../bd/connections.js", () => ({
  promise: () => ({
    query: mockQuery,
  }),
}));

const authController = require("../../controllers/auth_controller");

describe("Pruebas Unitarias - Registro Email Duplicado", () => {
  let req, res;

  beforeEach(() => {
    jest.clearAllMocks();

    req = {
      body: {
        nombre: "Angel David",
        email: "angel@test.com",
        password: "123456",
      },
    };

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
  });

  test("Debe retornar 400 cuando el usuario ya existe", async () => {
    console.log("\n[TEST] register - Email Duplicado");

    // Simula que la BD encontró un usuario con ese correo
    mockQuery.mockResolvedValue([
      [
        {
          id: 1,
          email: "angel@test.com",
        },
      ],
    ]);

    await authController.register(req, res);

    expect(res.status).toHaveBeenCalledWith(400);

    expect(res.json).toHaveBeenCalledWith({
      mensaje: "El usuario ya existe",
    });

    console.log(
      "✓ POSITIVO - Output:",
      JSON.stringify({ mensaje: "El usuario ya existe" }),
    );
  });
});
