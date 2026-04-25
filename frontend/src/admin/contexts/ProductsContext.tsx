// frontend/src/admin/contexts/ProductsContext.tsx
import { createContext, useContext, useState, useEffect, useCallback } from "react";
import api from "../../services/api";

interface AdminProduct {
    id: number;
    titulo: string;
    precio: number | string;
    stock: number;
    categoria_nombre?: string;
    descripcion?: string;
    imagen_principal?: string;
    precio_anterior?: number | string;
    [key: string]: unknown;
}

interface ProductsContextType {
    products: AdminProduct[];
    loading: boolean;
    fetchProducts: () => Promise<void>;
    getProductById: (id: number | string) => AdminProduct | undefined;
    createProduct: (productData: FormData) => Promise<unknown>;
    updateProduct: (id: number | string, productData: FormData) => Promise<unknown>;
    deleteProduct: (id: number | string) => Promise<unknown>;
}

const ProductsContext = createContext<ProductsContextType | null>(null);

export function ProductsProvider({ children }: { children: React.ReactNode }) {
    const [products, setProducts] = useState<AdminProduct[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchProducts = useCallback(async () => {
        setLoading(true);
        try {
            const { data } = await api.get<AdminProduct[]>("/admin/productos");
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

    const getProductById = (id: number | string) =>
        products.find((p) => p.id === Number(id));

    const createProduct = async (productData: FormData) => {
        const { data } = await api.post("/admin/productos", productData);
        await fetchProducts();
        return data;
    };

    const updateProduct = async (id: number | string, productData: FormData) => {
        const { data } = await api.put(`/admin/productos/${id}`, productData);
        setProducts((prev) =>
            prev.map((p) => (p.id === Number(id) ? { ...p, ...Object.fromEntries(productData) } : p))
        );
        return data;
    };

    const deleteProduct = async (id: number | string) => {
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
