import axios from "axios";

const baseURL = import.meta.env.VITE_API_BASE_URL;

// ⚠️ Si no hay variable de entorno, muestra un error CLARO
if (!baseURL) {
  console.error('❌ ERROR CRÍTICO: VITE_API_BASE_URL no está definida');
  console.error('📋 En RENDER → Environment Variables, agrega:');
  console.error('📋 Clave: VITE_API_BASE_URL');
  console.error('📋 Valor: https://blackmichi-backend-latest.onrender.com');
  console.error('❌ El frontend usará localhost como fallback (solo funciona en desarrollo)');
}

const finalBaseURL = baseURL || "http://localhost:3000";
const finalURL = finalBaseURL.endsWith('/api') ? finalBaseURL : `${finalBaseURL}/api`;

console.log('🔍 Entorno:', import.meta.env.MODE);
console.log('🔍 VITE_API_BASE_URL:', baseURL);
console.log('🔍 Final API URL:', finalURL);

const api = axios.create({
  baseURL: finalURL,
  headers: {
    'Content-Type': 'application/json'
  }
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;