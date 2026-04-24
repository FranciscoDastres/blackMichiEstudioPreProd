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
function mockReq(headers: Record<string, string> = {}) {
  return { headers } as unknown as import("express").Request;
}

function mockRes() {
  const res = {} as Record<string, unknown>;
  res["status"] = vi.fn().mockReturnValue(res);
  res["json"] = vi.fn().mockReturnValue(res);
  return res as unknown as import("express").Response;
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

    expect((res as any).status).toHaveBeenCalledWith(401);
    expect((res as any).json).toHaveBeenCalledWith({ error: "No autorizado" });
    expect(next).not.toHaveBeenCalled();
  });

  it("retorna 401 si supabase rechaza el token", async () => {
    mockGetUser.mockResolvedValue({ data: {}, error: new Error("bad token") });

    const req = mockReq({ authorization: "Bearer bad-token" });
    const res = mockRes();
    const next = vi.fn();

    await requireAuth(req, res, next);

    expect((res as any).status).toHaveBeenCalledWith(401);
    expect((res as any).json).toHaveBeenCalledWith({ error: "Token inválido" });
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

    expect((res as any).status).toHaveBeenCalledWith(401);
    expect((res as any).json).toHaveBeenCalledWith({ error: "Usuario no encontrado" });
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

    expect((req as any).user).toEqual(dbUser);
    expect(next).toHaveBeenCalled();
    expect((res as any).status).not.toHaveBeenCalled();
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

    expect((res as any).status).toHaveBeenCalledWith(401);
    expect((res as any).json).toHaveBeenCalledWith({ error: "Token inválido" });
  });
});

// ============================================
// requireAdmin
// ============================================
describe("requireAdmin", () => {
  it("retorna 401 si req.user no existe", () => {
    const req = {} as import("express").Request;
    const res = mockRes();
    const next = vi.fn();

    requireAdmin(req, res, next);

    expect((res as any).status).toHaveBeenCalledWith(401);
    expect((res as any).json).toHaveBeenCalledWith({ error: "No autenticado" });
  });

  it("retorna 403 si el usuario no es admin", () => {
    const req = { user: { rol: "cliente" } } as unknown as import("express").Request;
    const res = mockRes();
    const next = vi.fn();

    requireAdmin(req, res, next);

    expect((res as any).status).toHaveBeenCalledWith(403);
    expect((res as any).json).toHaveBeenCalledWith({ error: "Solo admin" });
  });

  it("llama next() si el usuario es admin", () => {
    const req = { user: { rol: "admin" } } as unknown as import("express").Request;
    const res = mockRes();
    const next = vi.fn();

    requireAdmin(req, res, next);

    expect(next).toHaveBeenCalled();
    expect((res as any).status).not.toHaveBeenCalled();
  });
});
