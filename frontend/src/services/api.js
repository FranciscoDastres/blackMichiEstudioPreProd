import axios from "axios";

const baseURL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";
const finalURL = baseURL.endsWith('/api') ? baseURL : `${baseURL}/api`;

// 🔍 LOG PARA DEBUG - Esto se verá en la consola del navegador
console.log('🔍 Variables de entorno:', import.meta.env);
console.log('🔍 VITE_API_BASE_URL:', import.meta.env.VITE_API_BASE_URL);
console.log('🔍 BaseURL original:', baseURL);
console.log('🔍 Final URL que se usará:', finalURL);

const api = axios.create({ baseURL: finalURL });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default api;