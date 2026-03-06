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

// ✅ RESPONSE INTERCEPTOR CON VALIDACIÓN
api.interceptors.response.use(
  response => {
    // ✅ Validar que response.data existe
    if (!response.data) {
      console.warn('⚠️ Response sin data:', response);
      return { ...response, data: {} };
    }
    return response;
  },
  error => {
    // ✅ Manejo seguro de errores
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }

    // ✅ Loguear error completo para debugging
    console.error('❌ API Error:', {
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      message: error.message,
      url: error.config?.url
    });

    return Promise.reject(error);
  }
);

export default api;