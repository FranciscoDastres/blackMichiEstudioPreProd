// backend/utils/validators.js
// Validadores reutilizables para inputs de usuarios
// Lanzan errores con { status: 400 } que el global error handler convierte en respuestas 400

function badRequest(message) {
    return Object.assign(new Error(message), { status: 400 });
}

export function assertEnum(value, allowed, fieldName) {
    if (!allowed.includes(value)) {
        throw badRequest(
            `${fieldName} inválido. Valores permitidos: ${allowed.join(", ")}`
        );
    }
    return value;
}

export function assertPositiveNumber(value, fieldName) {
    const n = Number(value);
    if (!Number.isFinite(n) || n <= 0) {
        throw badRequest(`${fieldName} debe ser un número positivo`);
    }
    return n;
}

export function assertNonNegativeInt(value, fieldName) {
    const n = Number(value);
    if (!Number.isInteger(n) || n < 0) {
        throw badRequest(`${fieldName} debe ser un entero no negativo`);
    }
    return n;
}

export function assertString(value, fieldName, { min = 1, max = 255 } = {}) {
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
export const USER_ROLES = ["admin", "cliente"];
export const ORDER_STATES = ["pendiente", "pagado", "rechazado", "cancelado", "enviado", "entregado"];
