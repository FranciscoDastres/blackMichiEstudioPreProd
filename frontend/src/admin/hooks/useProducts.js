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
            setProducts(data);
        } catch (err) {
            console.error("Error cargando productos:", err);
        } finally {
            setLoading(false);
        }
    };

    const getProductById = (id) => {
        return products.find((p) => p.id === Number(id));
    };

    const createProduct = async (productData) => {
        try {
            const { data } = await api.post("/admin/productos", productData);
            setProducts((prev) => [...prev, data]);
            return data;
        } catch (err) {
            console.error("Error creando producto:", err);
            throw err;
        }
    };

    // ✅ ESTA FUNCIÓN ESTABA MAL (tenías código de backend aquí)
    const updateProduct = async (id, productData) => {
        try {
            // Enviar los datos al backend
            const { data } = await api.put(`/admin/productos/${id}`, productData);

            // Actualizar el estado local sin recargar
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

            console.log('✅ Producto eliminado:', response.data);

            // ✅ AGREGAR ESTA LÍNEA: Recargar desde el servidor
            await fetchProducts();

            return response.data;

        } catch (error) {
            console.error('Error eliminando producto:', error);
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
