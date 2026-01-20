import { useNavigate, useParams } from "react-router-dom";
import ProductForm from "../../components/ProductForm";
import useProducts from "../../hooks/useProducts";

export default function ProductEdit() {
    const { productId } = useParams();
    const { getProductById, updateProduct } = useProducts();
    const navigate = useNavigate();

    const product = getProductById(Number(productId));

    const handleSubmit = async (updatedData) => {
        await updateProduct(productId, updatedData);
        navigate("/admin/products");
    };

    if (!product) {
        return <p className="p-6 text-center">Producto no encontrado.</p>;
    }

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-4">Editar Producto</h1>
            <ProductForm initialData={product} onSubmit={handleSubmit} />
        </div>
    );
}
