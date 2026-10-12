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

// Mock de JWT
jest.mock("jsonwebtoken", () => ({
  sign: jest.fn(() => "token_prueba"),
}));

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const authController = require("../../controllers/auth_controller");

describe("Pruebas Unitarias - Login Exitoso", () => {
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

  test("Debe iniciar sesión correctamente", async () => {
    console.log("\n[TEST] login - Éxito");

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

    bcrypt.compare.mockResolvedValue(true);

    await authController.login(req, res);

    expect(jwt.sign).toHaveBeenCalled();

    expect(res.json).toHaveBeenCalledWith({
      mensaje: "Login exitoso",
      token: "token_prueba",
    });

    console.log(
      "✓ POSITIVO - Output:",
      JSON.stringify({
        mensaje: "Login exitoso",
        token: "token_prueba",
      }),
    );
  });
});
