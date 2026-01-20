import axios from "axios";

// ✅ Construcción robusta de la URL
const getBaseURL = () => {
    const envUrl = import.meta.env.VITE_API_URL;
    if (envUrl) {
        // Si la URL ya trae /api, no la duplicamos
        return envUrl.endsWith('/api') ? envUrl : `${envUrl}/api`;
    }
    return "http://localhost:3000/api";
};

const api = axios.create({
    baseURL: getBaseURL(),
});

// ✅ Interceptor corregido (Sin código muerto después del return)
api.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");

    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    // El console.log debe ir ANTES del return, si no, rompe el build de Vite
    // console.log("Configuración de la solicitud:", config); 

    return config;
});

export default api;