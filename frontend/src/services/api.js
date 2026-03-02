import axios from "axios";

const baseURL = import.meta.env.VITE_API_BASE_URL;

// ⚠️ Si no hay variable de entorno, muestra un error CLARO
if (!baseURL) {
  console.error('❌ ERROR CRÍTICO: VITE_API_BASE_URL no está definida en Vercel');
  console.error('❌ Ve a Project Settings → Environment Variables y agrega:');
  console.error('❌ VITE_API_BASE_URL = https://blackmichi-backend-latest.onrender.com');
}

const finalBaseURL = baseURL || "http://localhost:3000";
const finalURL = finalBaseURL.endsWith('/api') ? finalBaseURL : `${finalBaseURL}/api`;

console.log('🔍 VITE_API_BASE_URL:', import.meta.env.VITE_API_BASE_URL);
console.log('🔍 BaseURL original:', finalBaseURL);
console.log('🔍 Final URL que se usará:', finalURL);

const api = axios.create({ baseURL: finalURL });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default api;