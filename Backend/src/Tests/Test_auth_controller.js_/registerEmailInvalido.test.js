const authController = require("../../controllers/auth_controller");

describe("Pruebas Unitarias - Registro Email Inválido", () => {
  let req, res;

  beforeEach(() => {
    req = {
      body: {
        nombre: "Angel David",
        email: "angelgmail.com",
        password: "123456",
      },
    };

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
  });

  test("Debe retornar 400 cuando el email es inválido", async () => {
    console.log("\n[TEST] register - Email Inválido");

    await authController.register(req, res);

    expect(res.status).toHaveBeenCalledWith(400);

    expect(res.json).toHaveBeenCalledWith({
      mensaje: "Email inválido",
    });

    console.log(
      "✓ POSITIVO - Output:",
      JSON.stringify({ mensaje: "Email inválido" }),
    );
  });
});
