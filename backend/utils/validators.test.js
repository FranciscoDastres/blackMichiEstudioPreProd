import {
  assertString,
  assertPositiveNumber,
  assertNonNegativeInt,
  assertEnum,
  USER_ROLES,
  ORDER_STATES,
} from "./validators.js";

// ============================================
// assertString
// ============================================
describe("assertString", () => {
  it("devuelve el string trimmeado", () => {
    expect(assertString("  hola  ", "campo")).toBe("hola");
  });

  it("lanza error si no es string", () => {
    expect(() => assertString(123, "campo")).toThrow("campo debe ser texto");
  });

  it("lanza error si está vacío después de trim", () => {
    expect(() => assertString("   ", "nombre")).toThrow("nombre es requerido");
  });

  it("lanza error si excede max", () => {
    const largo = "a".repeat(256);
    expect(() => assertString(largo, "titulo")).toThrow(
      "titulo excede el máximo de 255 caracteres"
    );
  });

  it("acepta max personalizado", () => {
    expect(() => assertString("abc", "campo", { max: 2 })).toThrow(
      "campo excede el máximo de 2 caracteres"
    );
  });

  it("acepta min personalizado", () => {
    expect(() => assertString("ab", "campo", { min: 3 })).toThrow(
      "campo es requerido"
    );
  });

  it("pasa con longitud exacta al límite", () => {
    expect(assertString("ab", "campo", { max: 2 })).toBe("ab");
  });
});

// ============================================
// assertPositiveNumber
// ============================================
describe("assertPositiveNumber", () => {
  it("convierte string numérico y retorna number", () => {
    expect(assertPositiveNumber("10.5", "precio")).toBe(10.5);
  });

  it("acepta un número positivo", () => {
    expect(assertPositiveNumber(1, "precio")).toBe(1);
  });

  it("lanza error con 0", () => {
    expect(() => assertPositiveNumber(0, "precio")).toThrow(
      "precio debe ser un número positivo"
    );
  });

  it("lanza error con negativo", () => {
    expect(() => assertPositiveNumber(-5, "precio")).toThrow(
      "precio debe ser un número positivo"
    );
  });

  it("lanza error con NaN", () => {
    expect(() => assertPositiveNumber("abc", "precio")).toThrow(
      "precio debe ser un número positivo"
    );
  });

  it("lanza error con Infinity", () => {
    expect(() => assertPositiveNumber(Infinity, "precio")).toThrow(
      "precio debe ser un número positivo"
    );
  });
});

// ============================================
// assertNonNegativeInt
// ============================================
describe("assertNonNegativeInt", () => {
  it("acepta 0", () => {
    expect(assertNonNegativeInt(0, "stock")).toBe(0);
  });

  it("acepta entero positivo", () => {
    expect(assertNonNegativeInt(10, "stock")).toBe(10);
  });

  it("convierte string numérico entero", () => {
    expect(assertNonNegativeInt("5", "stock")).toBe(5);
  });

  it("lanza error con decimal", () => {
    expect(() => assertNonNegativeInt(1.5, "stock")).toThrow(
      "stock debe ser un entero no negativo"
    );
  });

  it("lanza error con negativo", () => {
    expect(() => assertNonNegativeInt(-1, "stock")).toThrow(
      "stock debe ser un entero no negativo"
    );
  });

  it("lanza error con texto", () => {
    expect(() => assertNonNegativeInt("abc", "stock")).toThrow(
      "stock debe ser un entero no negativo"
    );
  });
});

// ============================================
// assertEnum
// ============================================
describe("assertEnum", () => {
  it("retorna el valor si está en la lista", () => {
    expect(assertEnum("admin", USER_ROLES, "rol")).toBe("admin");
  });

  it("lanza error si no está en la lista", () => {
    expect(() => assertEnum("superadmin", USER_ROLES, "rol")).toThrow(
      "rol inválido. Valores permitidos: admin, cliente"
    );
  });

  it("funciona con ORDER_STATES", () => {
    expect(assertEnum("pagado", ORDER_STATES, "estado")).toBe("pagado");
  });

  it("rechaza estado inválido", () => {
    expect(() => assertEnum("procesando", ORDER_STATES, "estado")).toThrow(
      "estado inválido"
    );
  });
});
