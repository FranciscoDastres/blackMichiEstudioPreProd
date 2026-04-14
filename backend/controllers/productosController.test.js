import { vi, describe, it, expect, afterEach } from "vitest";

// ============================================
// Mocks
// ============================================
const { mockProductService } = vi.hoisted(() => ({
  mockProductService: {
    createProduct: vi.fn(),
    updateProduct: vi.fn(),
    deleteProduct: vi.fn(),
    getAllProducts: vi.fn(),
    getProductById: vi.fn(),
  },
}));

vi.mock("../services/productService.js", () => mockProductService);

import {
  createProduct,
  updateProduct,
  deleteProduct,
  getAllProducts,
  getProductById,
} from "./productosController.js";

// ============================================
// Helpers
// ============================================
function mockRes() {
  const res = {};
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  return res;
}

// ============================================
// createProduct
// ============================================
describe("createProduct", () => {
  afterEach(() => vi.clearAllMocks());

  it("retorna 201 al crear producto exitosamente", async () => {
    mockProductService.createProduct.mockResolvedValue({ success: true });

    const req = {
      body: { nombre: "Camiseta", precio: "15000", stock: "10" },
      files: [],
    };
    const res = mockRes();

    await createProduct(req, res);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({
      ok: true,
      message: "Producto creado correctamente",
    });
  });

  it("retorna 400 si el nombre no es string", async () => {
    const req = {
      body: { nombre: 123, precio: "15000", stock: "10" },
      files: [],
    };
    const res = mockRes();

    await createProduct(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ error: expect.stringContaining("nombre") })
    );
  });

  it("retorna 400 si el precio es negativo", async () => {
    const req = {
      body: { nombre: "Camiseta", precio: "-5", stock: "10" },
      files: [],
    };
    const res = mockRes();

    await createProduct(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ error: expect.stringContaining("precio") })
    );
  });

  it("retorna 400 si el stock es decimal", async () => {
    const req = {
      body: { nombre: "Camiseta", precio: "15000", stock: "1.5" },
      files: [],
    };
    const res = mockRes();

    await createProduct(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ error: expect.stringContaining("stock") })
    );
  });

  it("pasa campos opcionales como null si no vienen", async () => {
    mockProductService.createProduct.mockResolvedValue({ success: true });

    const req = {
      body: { nombre: "Camiseta", precio: "15000", stock: "10" },
      files: [],
    };
    const res = mockRes();

    await createProduct(req, res);

    expect(mockProductService.createProduct).toHaveBeenCalledWith(
      "Camiseta",
      15000,
      10,
      null,
      null,
      []
    );
  });

  it("retorna 500 si el service lanza error sin status", async () => {
    mockProductService.createProduct.mockRejectedValue(new Error("DB error"));

    const req = {
      body: { nombre: "Test", precio: "100", stock: "1" },
      files: [],
    };
    const res = mockRes();

    await createProduct(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
  });
});

// ============================================
// getAllProducts
// ============================================
describe("getAllProducts", () => {
  afterEach(() => vi.clearAllMocks());

  it("retorna la lista de productos", async () => {
    const products = [
      { id: 1, titulo: "A" },
      { id: 2, titulo: "B" },
    ];
    mockProductService.getAllProducts.mockResolvedValue(products);

    const req = {};
    const res = mockRes();

    await getAllProducts(req, res);

    expect(res.json).toHaveBeenCalledWith(products);
  });

  it("retorna 500 si hay error", async () => {
    mockProductService.getAllProducts.mockRejectedValue(new Error("fail"));

    const req = {};
    const res = mockRes();

    await getAllProducts(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
  });
});

// ============================================
// getProductById
// ============================================
describe("getProductById", () => {
  afterEach(() => vi.clearAllMocks());

  it("retorna el producto si existe", async () => {
    const product = { id: 1, titulo: "Camiseta" };
    mockProductService.getProductById.mockResolvedValue(product);

    const req = { params: { id: "1" } };
    const res = mockRes();

    await getProductById(req, res);

    expect(res.json).toHaveBeenCalledWith(product);
  });

  it("retorna 400 si no viene ID", async () => {
    const req = { params: {} };
    const res = mockRes();

    await getProductById(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  it("retorna 404 si el producto no existe", async () => {
    mockProductService.getProductById.mockRejectedValue(
      new Error("Producto no encontrado")
    );

    const req = { params: { id: "999" } };
    const res = mockRes();

    await getProductById(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
  });
});

// ============================================
// deleteProduct
// ============================================
describe("deleteProduct", () => {
  afterEach(() => vi.clearAllMocks());

  it("retorna ok al eliminar", async () => {
    mockProductService.deleteProduct.mockResolvedValue({ success: true });

    const req = { params: { id: "1" } };
    const res = mockRes();

    await deleteProduct(req, res);

    expect(res.json).toHaveBeenCalledWith({
      ok: true,
      message: "Producto eliminado",
    });
  });

  it("retorna 400 si no viene ID", async () => {
    const req = { params: {} };
    const res = mockRes();

    await deleteProduct(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });
});

// ============================================
// updateProduct
// ============================================
describe("updateProduct", () => {
  afterEach(() => vi.clearAllMocks());

  it("retorna datos actualizados", async () => {
    const updated = { id: 1, titulo: "Nuevo", precio: 20000 };
    mockProductService.updateProduct.mockResolvedValue(updated);

    const req = {
      params: { id: "1" },
      body: { titulo: "Nuevo", precio: "20000", stock: "5" },
      files: [],
    };
    const res = mockRes();

    await updateProduct(req, res);

    expect(res.json).toHaveBeenCalledWith({ ok: true, data: updated });
  });

  it("retorna 400 si no viene ID", async () => {
    const req = {
      params: {},
      body: { titulo: "X", precio: "1", stock: "1" },
      files: [],
    };
    const res = mockRes();

    await updateProduct(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  it("retorna 404 si el producto no existe", async () => {
    mockProductService.updateProduct.mockRejectedValue(
      new Error("Producto no encontrado")
    );

    const req = {
      params: { id: "999" },
      body: { titulo: "X", precio: "1", stock: "1" },
      files: [],
    };
    const res = mockRes();

    await updateProduct(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
  });
});
