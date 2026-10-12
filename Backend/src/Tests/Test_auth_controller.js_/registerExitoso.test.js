// Mock de consultas a BD
const mockQuery = jest.fn();

jest.mock("../../bd/connections.js", () => ({
  promise: () => ({
    query: mockQuery,
  }),
}));

// Mock bcrypt
jest.mock("bcryptjs", () => ({
  hash: jest.fn(),
}));

// Mock JWT
jest.mock("jsonwebtoken", () => ({
  sign: jest.fn(() => "token_prueba"),
}));

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const authController = require("../../controllers/auth_controller");

describe("Pruebas Unitarias - Registro Exitoso", () => {
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

  test("Debe registrar un usuario correctamente", async () => {
    console.log("\n[TEST] register - Éxito");

    // Primera consulta: verificar usuario existente
    // Segunda consulta: insertar usuario
    mockQuery
      .mockResolvedValueOnce([[]])
      .mockResolvedValueOnce([{ insertId: 1 }]);

    bcrypt.hash.mockResolvedValue("password_hasheada");

    await authController.register(req, res);

    expect(bcrypt.hash).toHaveBeenCalled();

    expect(jwt.sign).toHaveBeenCalled();

    expect(res.json).toHaveBeenCalledWith({
      mensaje: "Usuario registrado",
      token: "token_prueba",
    });

    console.log(
      "✓ POSITIVO - Output:",
      JSON.stringify({
        mensaje: "Usuario registrado",
        token: "token_prueba",
      }),
    );
  });
});
