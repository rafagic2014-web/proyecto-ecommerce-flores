const authController = require("../../controllers/auth_controller");
const connection = require("../../bd/connections");

jest.mock("../../bd/connections.js", () => ({
  query: jest.fn(),
  promise: () => ({
    query: jest.fn(),
  }),
}));

describe("Pruebas Unitarias - Login", () => {
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

  test("Debe retornar 400 si faltan datos", async () => {
    req.body = {};

    await authController.login(req, res);

    expect(res.status).toHaveBeenCalledWith(400);

    expect(res.json).toHaveBeenCalledWith({
      mensaje: "Correo y contraseña son obligatorios",
    });
  });
});
