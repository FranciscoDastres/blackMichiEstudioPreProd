import axios, { InternalAxiosRequestConfig, AxiosResponse, AxiosError } from "axios";

const baseURL = import.meta.env.VITE_API_BASE_URL as string | undefined;

if (!baseURL) {
  throw new Error('VITE_API_BASE_URL no está definida. Verifica el archivo .env antes de hacer build.');
}

const finalURL = baseURL.endsWith('/api') ? baseURL : `${baseURL}/api`;

const api = axios.create({
  baseURL: finalURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  // Si el body es FormData, dejar que el browser setee el Content-Type
  // (necesita incluir el boundary del multipart/form-data automáticamente)
  if (config.data instanceof FormData) {
    delete config.headers['Content-Type'];
  }

  return config;
});

api.interceptors.response.use(
  (response: AxiosResponse) => {
    if (!response.data) {
      console.warn('⚠️ Response sin data:', response);
      return { ...response, data: {} };
    }
    return response;
  },
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      const url = error.config?.url ?? '';
      if (!url.includes('/auth/me') && !url.includes('/auth/login')) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    }
    console.error('❌ API Error:', {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message,
      url: error.config?.url,
    });
    return Promise.reject(error);
  }
);

export default api;
