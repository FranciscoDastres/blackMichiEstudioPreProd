/**
 * ✅ Utility para debuggear errores de "Cannot read properties of undefined"
 */

export const safeAccess = (obj, path, fallback = null) => {
    try {
        if (!obj || typeof obj !== 'object') return fallback;

        const keys = path.split('.');
        let current = obj;

        for (const key of keys) {
            if (!current || typeof current !== 'object') {
                console.warn(`⚠️ Cannot access ${key} on:`, current);
                return fallback;
            }
            current = current[key];
        }

        return current ?? fallback;
    } catch (err) {
        console.error(`❌ Error accessing ${path}:`, err);
        return fallback;
    }
};

/**
 * Validar y loguear respuesta de API
 */
export const validateAPIResponse = (response, endpoint = '') => {
    console.log(`🔍 API Response [${endpoint}]:`, {
        status: response?.status,
        hasData: !!response?.data,
        dataType: typeof response?.data,
        dataKeys: response?.data ? Object.keys(response.data) : [],
        data: response?.data
    });

    if (!response?.data) {
        console.error(`❌ No data in response from ${endpoint}`, response);
    }

    return response?.data;
};

/**
 * Crear un proxy que logguea accesos inválidos
 */
export const createSafeProxy = (obj, name = 'object') => {
    return new Proxy(obj || {}, {
        get(target, prop) {
            if (!(prop in target)) {
                console.warn(`⚠️ Accessing non-existent property "${String(prop)}" on ${name}`);
            }
            return target[prop];
        }
    });
};
