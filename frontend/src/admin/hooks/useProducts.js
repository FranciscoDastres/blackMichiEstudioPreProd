// frontend/src/admin/hooks/useProducts.js
import { useState, useEffect } from "react";
import api from "../../services/api";

export default function useProducts() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        setLoading(true);
        try {
            const { data } = await api.get("/admin/productos");
            setProducts(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error("❌ Error cargando productos:", err);
            setProducts([]);
        } finally {
            setLoading(false);
        }
    };

    const getProductById = (id) => products.find((p) => p.id === Number(id));

    const createProduct = async (productData) => {
        try {
            const { data } = await api.post("/admin/productos", productData);
            await fetchProducts(); // recargar lista completa
            return data;
        } catch (err) {
            console.error("Error creando producto:", err);
            throw err;
        }
    };

    const updateProduct = async (id, productData) => {
        try {
            const { data } = await api.put(`/admin/productos/${id}`, productData);
            // ✅ Actualizar estado local inmediatamente
            setProducts((prev) =>
                prev.map((p) => (p.id === Number(id) ? { ...p, ...productData } : p))
            );
            return data;
        } catch (err) {
            console.error("Error actualizando producto:", err);
            throw err;
        }
    };

    const deleteProduct = async (id) => {
        try {
            const response = await api.delete(`/admin/productos/${id}`);
            // ✅ Eliminar del estado local inmediatamente — sin esperar fetch
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
