// backend/utils/validators.ts
// Validadores reutilizables para inputs de usuarios
// Lanzan errores con { status: 400 } que el global error handler convierte en respuestas 400

interface HttpError extends Error {
  status: number;
}

function badRequest(message: string): HttpError {
  return Object.assign(new Error(message), { status: 400 });
}

export function assertEnum<T extends string>(
  value: unknown,
  allowed: readonly T[],
  fieldName: string
): T {
  if (!allowed.includes(value as T)) {
    throw badRequest(
      `${fieldName} inválido. Valores permitidos: ${(allowed as readonly string[]).join(", ")}`
    );
  }
  return value as T;
}

export function assertPositiveNumber(value: unknown, fieldName: string): number {
  const n = Number(value);
  if (!Number.isFinite(n) || n <= 0) {
    throw badRequest(`${fieldName} debe ser un número positivo`);
  }
  return n;
}

export function assertNonNegativeInt(value: unknown, fieldName: string): number {
  const n = Number(value);
  if (!Number.isInteger(n) || n < 0) {
    throw badRequest(`${fieldName} debe ser un entero no negativo`);
  }
  return n;
}

interface AssertStringOptions {
  min?: number;
  max?: number;
}

export function assertString(
  value: unknown,
  fieldName: string,
  { min = 1, max = 255 }: AssertStringOptions = {}
): string {
  if (typeof value !== "string") {
    throw badRequest(`${fieldName} debe ser texto`);
  }
  const trimmed = value.trim();
  if (trimmed.length < min) {
    throw badRequest(`${fieldName} es requerido`);
  }
  if (trimmed.length > max) {
    throw badRequest(`${fieldName} excede el máximo de ${max} caracteres`);
  }
  return trimmed;
}

// Enums del dominio
export const USER_ROLES = ["admin", "cliente"] as const;
export const ORDER_STATES = [
  "pendiente",
  "pagado",
  "rechazado",
  "cancelado",
  "enviado",
  "entregado",
] as const;

export type UserRole = (typeof USER_ROLES)[number];
export type OrderState = (typeof ORDER_STATES)[number];
