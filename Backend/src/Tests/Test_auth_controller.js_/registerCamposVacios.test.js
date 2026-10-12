const authController = require("../../controllers/auth_controller");

describe("Pruebas Unitarias - Register", () => {
  let req, res;

  beforeEach(() => {
    req = {
      body: {},
    };

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
  });

  test("Debe retornar 400 cuando faltan campos", async () => {
    req.body = {
      nombre: "",
      email: "",
      password: "",
    };

    await authController.register(req, res);

    expect(res.status).toHaveBeenCalledWith(400);

    expect(res.json).toHaveBeenCalledWith({
      mensaje: "Todos los campos son obligatorios",
    });
  });
});
