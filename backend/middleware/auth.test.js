import { vi, describe, it, expect, afterEach } from "vitest";

// ============================================
// Mocks (vi.hoisted + vi.mock = ESM nativo)
// ============================================
const { mockQuery, mockGetUser } = vi.hoisted(() => ({
  mockQuery: vi.fn(),
  mockGetUser: vi.fn(),
}));

vi.mock("../lib/db.js", () => ({
  default: { query: mockQuery, pool: {} },
}));

vi.mock("@supabase/supabase-js", () => ({
  createClient: () => ({
    auth: {
      getUser: mockGetUser,
    },
  }),
}));

import { requireAuth, requireAdmin } from "./auth.js";

// ============================================
// Helpers
// ============================================
function mockReq(headers = {}) {
  return { headers };
}

function mockRes() {
  const res = {};
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  return res;
}

// ============================================
// requireAuth
// ============================================
describe("requireAuth", () => {
  afterEach(() => vi.clearAllMocks());

  it("retorna 401 si no hay header Authorization", async () => {
    const req = mockReq();
    const res = mockRes();
    const next = vi.fn();

    await requireAuth(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: "No autorizado" });
    expect(next).not.toHaveBeenCalled();
  });

  it("retorna 401 si supabase rechaza el token", async () => {
    mockGetUser.mockResolvedValue({ data: {}, error: new Error("bad token") });

    const req = mockReq({ authorization: "Bearer bad-token" });
    const res = mockRes();
    const next = vi.fn();

    await requireAuth(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: "Token inválido" });
  });

  it("retorna 401 si el usuario no existe en la DB", async () => {
    mockGetUser.mockResolvedValue({
      data: { user: { id: "auth-123" } },
      error: null,
    });
    mockQuery.mockResolvedValue({ rows: [] });

    const req = mockReq({ authorization: "Bearer valid-token" });
    const res = mockRes();
    const next = vi.fn();

    await requireAuth(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: "Usuario no encontrado" });
  });

  it("setea req.user y llama next() con token válido y usuario en DB", async () => {
    const dbUser = { id: 1, nombre: "Test", email: "t@t.com", rol: "admin" };

    mockGetUser.mockResolvedValue({
      data: { user: { id: "auth-123" } },
      error: null,
    });
    mockQuery.mockResolvedValue({ rows: [dbUser] });

    const req = mockReq({ authorization: "Bearer valid-token" });
    const res = mockRes();
    const next = vi.fn();

    await requireAuth(req, res, next);

    expect(req.user).toEqual(dbUser);
    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
  });

  it("verifica que la query busca por auth_id correcto", async () => {
    mockGetUser.mockResolvedValue({
      data: { user: { id: "supabase-uid-456" } },
      error: null,
    });
    mockQuery.mockResolvedValue({ rows: [{ id: 1, rol: "cliente" }] });

    const req = mockReq({ authorization: "Bearer tk" });
    const res = mockRes();
    const next = vi.fn();

    await requireAuth(req, res, next);

    expect(mockQuery).toHaveBeenCalledWith(
      expect.stringContaining("auth_id"),
      ["supabase-uid-456"]
    );
  });

  it("retorna 401 si getUser lanza excepción", async () => {
    mockGetUser.mockRejectedValue(new Error("network error"));

    const req = mockReq({ authorization: "Bearer some-token" });
    const res = mockRes();
    const next = vi.fn();

    await requireAuth(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: "Token inválido" });
  });
});

// ============================================
// requireAdmin
// ============================================
describe("requireAdmin", () => {
  it("retorna 401 si req.user no existe", () => {
    const req = {};
    const res = mockRes();
    const next = vi.fn();

    requireAdmin(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: "No autenticado" });
  });

  it("retorna 403 si el usuario no es admin", () => {
    const req = { user: { rol: "cliente" } };
    const res = mockRes();
    const next = vi.fn();

    requireAdmin(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({ error: "Solo admin" });
  });

  it("llama next() si el usuario es admin", () => {
    const req = { user: { rol: "admin" } };
    const res = mockRes();
    const next = vi.fn();

    requireAdmin(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
  });
});
