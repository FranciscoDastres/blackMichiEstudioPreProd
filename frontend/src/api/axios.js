import axios from "axios";

// Buscamos la URL de Render, si no existe (local), usamos localhost
const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL
        ? `${import.meta.env.VITE_API_URL}/api`
        : "http://localhost:3000/api",
});

// Interceptor para enviar token automáticamente
api.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");

    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
    console.log("Configuración de la solicitud:", config)
});

export default api;