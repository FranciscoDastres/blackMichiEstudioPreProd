import { useNavigate } from "react-router-dom";
import ProductTable from "../../components/ProductTable";

export default function ProductsPage() {
    const navigate = useNavigate();

    const handleCreate = () => {
        navigate("/admin/products/create");
    };

    return (
        <div className="p-6 space-y-4">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold">Productos</h1>
                <button
                    onClick={handleCreate}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                    Crear Producto
                </button>
            </div>

            <ProductTable />
        </div>
    );
}
