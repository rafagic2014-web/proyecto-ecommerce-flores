const mockQuery = jest.fn();

jest.mock("../../bd/connections.js", () => ({
  query: mockQuery,
  promise: () => ({
    query: jest.fn(),
  }),
}));

const authController = require("../../controllers/auth_controller");

describe("Pruebas Unitarias - Obtener Usuarios", () => {
  let req, res;

  beforeEach(() => {
    jest.clearAllMocks();

    req = {};

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
  });

  test("Debe retornar la lista de usuarios", () => {
    console.log("\n[TEST] getUsuarios - Éxito");

    const usuarios = [
      {
        id: 1,
        nombre: "Angel",
        email: "angel@test.com",
        rol: "cliente",
      },
    ];

    mockQuery.mockImplementation((sql, callback) => {
      callback(null, usuarios);
    });

    authController.getUsuarios(req, res);

    expect(res.json).toHaveBeenCalledWith(usuarios);

    console.log("✓ POSITIVO - Output:", JSON.stringify(usuarios));
  });
});
