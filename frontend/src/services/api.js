// frontend/src/services/api.js
import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use(
  config => {
    const token = localStorage.getItem("token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  error => Promise.reject(error)
);

api.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

const ApiService = {
  // PRODUCTOS
  async getProductos() {
    const { data } = await api.get("/productos");
    return data;
  },

  async getProductoPorId(id) {
    const { data } = await api.get(`/productos/${id}`);
    return data;
  },

  async buscarSugerencias(q) {
    const { data } = await api.get(`/productos/sugerencias?q=${encodeURIComponent(q)}`);
    return data;
  },
  async getProductosPorCategoria(categoria) {
    const { data } = await api.get(`/productos/categoria/${encodeURIComponent(categoria)}`);
    return data;
  },

  async getProductosPopulares() {
    const { data } = await api.get("productos/populares");
    return data;
  },

  async buscarProductos(q) {
    const { data } = await api.get(`/productos/buscar?q=${encodeURIComponent(q)}`);
    return data;
  },

  // CATEGORÍAS
  async getCategorias() {
    const { data } = await api.get("/categorias");
    return data;
  },

  // ⭐ PRODUCTOS DESTACADOS (HEADER)
  async getFeaturedProductos() {
    const { data } = await api.get("/featured-productos");
    return data;
  },

  // ADMIN — guardar destacados
  async setFeaturedProductos(productos) {
    const { data } = await api.post("/admin/featured-productos", {
      productos
    });
    return data;
  },

  // 👇👇👇 AÑADIDO: RESEÑAS 👇👇👇
  async getReviewsByProduct(productId) {
    const { data } = await api.get(`/reviews/producto/${productId}`);
    return data;
  },

  async submitReview(reviewData) {
    const { data } = await api.post("/reviews", reviewData);
    return data;
  }
};

export default ApiService;
export { api };