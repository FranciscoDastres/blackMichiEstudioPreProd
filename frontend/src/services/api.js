import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
});

// Interceptor de Petición: Inyectar Token
api.interceptors.request.use(
  config => {
    const token = localStorage.getItem("token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  error => Promise.reject(error)
);

// Interceptor de Respuesta: Manejo Global de Errores
api.interceptors.response.use(
  response => response,
  error => {
    // Si el token expiró o es inválido
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      // Solo redirigir si no estamos ya en login para evitar bucles
      if (!window.location.pathname.includes("/login")) {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

const ApiService = {
  // --- PRODUCTOS ---
  async getProductos() {
    const { data } = await api.get("/api/productos");
    return data;
  },

  async getProductoPorId(id) {
    const { data } = await api.get(`/api/productos/${id}`);
    return data;
  },

  async buscarSugerencias(q) {
    const { data } = await api.get(`/api/productos/sugerencias`, { params: { q } });
    return data;
  },

  async getProductosPorCategoria(categoria) {
    // Nota: verifica si tu backend usa /categoria/:nombre o /productos?categoria=nombre
    const { data } = await api.get(`/api/productos/categoria/${encodeURIComponent(categoria)}`);
    return data;
  },

  async getProductosPopulares() {
    const { data } = await api.get("/api/productos/populares");
    return data;
  },

  async buscarProductos(q) {
    const { data } = await api.get(`/api/productos/buscar`, { params: { q } });
    return data;
  },

  // --- CATEGORÍAS ---
  async getCategorias() {
    const { data } = await api.get("/api/categorias");
    return data;
  },

  // --- PRODUCTOS DESTACADOS (HOME/HEADER) ---
  async getFeaturedProductos() {
    const { data } = await api.get("/api/featured-productos");
    return data;
  },

  // ADMIN — Guardar configuración de destacados
  async setFeaturedProductos(productos) {
    const { data } = await api.post("/api/admin/featured-productos", { productos });
    return data;
  },

  // --- RESEÑAS (Normalizadas con /api) ---
  async getReviewsByProduct(productId) {
    // He añadido /api/ para mantener consistencia con tus otras rutas
    const { data } = await api.get(`/api/reviews/producto/${productId}`);
    return data;
  },

  async submitReview(reviewData) {
    const { data } = await api.post("/api/reviews", reviewData);
    return data;
  },

  // --- AUTH (Opcional, pero recomendado tenerlo aquí) ---
  async login(credentials) {
    const { data } = await api.post("/api/auth/login", credentials);
    return data;
  }
};

export default ApiService;
export { api };