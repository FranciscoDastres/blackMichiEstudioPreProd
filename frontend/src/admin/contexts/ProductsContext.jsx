// frontend/src/admin/contexts/ProductsContext.jsx
import { createContext, useContext, useState, useEffect, useCallback } from "react";
import api from "../../services/api";

const ProductsContext = createContext(null);

export function ProductsProvider({ children }) {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchProducts = useCallback(async () => {
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
    }, []);

    useEffect(() => {
        fetchProducts();
    }, [fetchProducts]);

    const getProductById = (id) => products.find((p) => p.id === Number(id));

    const createProduct = async (productData) => {
        const { data } = await api.post("/admin/productos", productData);
        await fetchProducts();
        return data;
    };

    const updateProduct = async (id, productData) => {
        const { data } = await api.put(`/admin/productos/${id}`, productData);
        setProducts((prev) =>
            prev.map((p) => (p.id === Number(id) ? { ...p, ...productData } : p))
        );
        return data;
    };

    const deleteProduct = async (id) => {
        const response = await api.delete(`/admin/productos/${id}`);
        setProducts((prev) => prev.filter((p) => p.id !== Number(id)));
        return response.data;
    };

    return (
        <ProductsContext.Provider value={{
            products,
            loading,
            fetchProducts,
            getProductById,
            createProduct,
            updateProduct,
            deleteProduct,
        }}>
            {children}
        </ProductsContext.Provider>
    );
}

export function useProducts() {
    const ctx = useContext(ProductsContext);
    if (!ctx) throw new Error("useProducts debe usarse dentro de ProductsProvider");
    return ctx;
}
