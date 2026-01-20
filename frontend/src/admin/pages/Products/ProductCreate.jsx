import { useNavigate } from "react-router-dom";
import ProductForm from "../../components/ProductForm";
import useProducts from "../../hooks/useProducts";

export default function ProductCreate() {
    const navigate = useNavigate();
    const { createProduct } = useProducts();

    const handleSubmit = async (productData) => {
        await createProduct(productData);
        navigate("/admin/products");
    };

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-4">Crear Producto</h1>
            <ProductForm onSubmit={handleSubmit} />
        </div>
    );
}
