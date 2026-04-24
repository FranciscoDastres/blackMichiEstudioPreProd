import { useState, useEffect } from "react";
import api from "../../services/api";
import type { Product } from "../../types";

export default function useProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async (): Promise<void> => {
    setLoading(true);
    try {
      const { data } = await api.get<Product[]>("/admin/productos");
      setProducts(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("❌ Error cargando productos:", err);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const getProductById = (id: number | string): Product | undefined =>
    products.find((p) => p.id === Number(id));

  const createProduct = async (productData: FormData | Partial<Product>): Promise<Product> => {
    try {
      const { data } = await api.post<Product>("/admin/productos", productData);
      await fetchProducts();
      return data;
    } catch (err) {
      console.error("Error creando producto:", err);
      throw err;
    }
  };

  const updateProduct = async (
    id: number | string,
    productData: FormData | Partial<Product>
  ): Promise<Product> => {
    try {
      const { data } = await api.put<Product>(`/admin/productos/${id}`, productData);
      // Actualizar estado local inmediatamente
      setProducts((prev) =>
        prev.map((p) => (p.id === Number(id) ? { ...p, ...productData as Partial<Product> } : p))
      );
      return data;
    } catch (err) {
      console.error("Error actualizando producto:", err);
      throw err;
    }
  };

  const deleteProduct = async (id: number | string): Promise<unknown> => {
    try {
      const response = await api.delete(`/admin/productos/${id}`);
      // Eliminar del estado local inmediatamente — sin esperar fetch
      setProducts((prev) => prev.filter((p) => p.id !== Number(id)));
      return response.data;
    } catch (error) {
      console.error("Error eliminando producto:", error);
      throw error;
    }
  };

  return {
    products,
    loading,
    fetchProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct,
  };
}
