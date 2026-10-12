// Mock primero
const mockQuery = jest.fn();

jest.mock("../../bd/connections.js", () => ({
  promise: () => ({
    query: mockQuery,
  }),
}));

// Mock de bcrypt
jest.mock("bcryptjs", () => ({
  compare: jest.fn(),
}));

const bcrypt = require("bcryptjs");
const authController = require("../../controllers/auth_controller");

describe("Pruebas Unitarias - Login Password Incorrecta", () => {
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

  test("Debe retornar 401 cuando la contraseña es incorrecta", async () => {
    console.log("\n[TEST] login - Password Incorrecta");

    // Simula usuario encontrado en BD
    mockQuery.mockResolvedValue([
      [
        {
          id: 1,
          nombre: "Angel",
          email: "correo@test.com",
          password: "hash_guardado",
          rol: "cliente",
          estado_activo: 1,
        },
      ],
    ]);

    // Simula contraseña incorrecta
    bcrypt.compare.mockResolvedValue(false);

    await authController.login(req, res);

    expect(res.status).toHaveBeenCalledWith(401);

    expect(res.json).toHaveBeenCalledWith({
      mensaje: "Contraseña incorrecta",
    });

    console.log(
      "✓ POSITIVO - Output:",
      JSON.stringify({ mensaje: "Contraseña incorrecta" }),
    );
  });
});
