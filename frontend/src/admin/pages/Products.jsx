import { useState } from "react";
import AdminTable from "../components/AdminTable";
import useProducts from "../hooks/useProducts";

export default function Products() {
    const { products, loading, deleteProduct, updateProduct } = useProducts();
    const [editingProduct, setEditingProduct] = useState(null);
    const [toast, setToast] = useState(null);

    // Estado del formulario (siempre definido)
    const [formData, setFormData] = useState({
        titulo: "",
        precio: 0,
        stock: 0,
        etiqueta: "",
        descripcion: "",
    });

    if (loading) return <p className="text-muted">Cargando productos...</p>;

    const showToast = (msg) => {
        setToast(msg);
        setTimeout(() => setToast(null), 2000);
    };

    // Al hacer clic en "Editar", carga los datos del producto en el formulario
    const handleEditClick = (product) => {
        setEditingProduct(product);
        setFormData({
            titulo: product.titulo || "",
            precio: product.precio || 0,
            stock: product.stock || 0,
            etiqueta: product.etiqueta || "",
            descripcion: product.descripcion || "",
        });
    };

    const handleInputChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            // ✅ Enviamos TODO el producto (con los nuevos valores en los campos editados)
            const updatedProduct = {
                ...editingProduct,
                ...formData,
                precio: Number(formData.precio),
                stock: Number(formData.stock),
            };

            await updateProduct(editingProduct.id, updatedProduct);
            setEditingProduct(null);
            showToast("Producto actualizado correctamente ✔");
        } catch (error) {
            console.error("Error actualizando producto:", error);
            showToast("❌ Error al actualizar");
        }
    };

    const columns = [
        { header: "ID", accessor: "id" },
        { header: "Nombre", accessor: "titulo" },
        { header: "Precio", accessor: "precio", cell: (value) => `$${value}` },
        { header: "Stock", accessor: "stock" },
        {
            header: "Acciones",
            accessor: "acciones",
            cell: (_, row) => (
                <div className="flex gap-2">
                    <button
                        onClick={async () => {
                            if (window.confirm(`¿Eliminar "${row.titulo}"?`)) {
                                try {
                                    await deleteProduct(row.id);
                                    showToast("Producto eliminado ✔");
                                } catch (error) {
                                    showToast("❌ Error al eliminar");
                                }
                            }
                        }}
                        className="px-2 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700 transition"
                    >
                        Borrar
                    </button>

                    <button
                        onClick={() => handleEditClick(row)}
                        className="px-2 py-1 text-xs bg-primary text-primary-foreground rounded hover:bg-primary/90 transition"
                    >
                        Editar
                    </button>
                </div>
            ),
        },
    ];

    return (
        <div className="space-y-8 p-4 sm:p-6 bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 min-h-screen">
            <h2 className="text-2xl font-bold text-foreground">Productos</h2>

            <AdminTable columns={columns} data={products} />

            {editingProduct && (
                <div className="max-w-3xl mx-auto mt-8">
                    <div className="bg-gray-800/60 backdrop-blur border border-gray-700 rounded-2xl shadow-xl overflow-hidden">
                        <div className="px-6 py-5 border-b border-gray-700">
                            <h3 className="text-xl font-bold text-white">Editar Producto</h3>
                            <p className="text-sm text-gray-400 mt-1">Actualiza los detalles del producto</p>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-5">
                            {/* Nombre */}
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">Nombre del producto</label>
                                <input
                                    type="text"
                                    value={formData.titulo}
                                    onChange={(e) => handleInputChange("titulo", e.target.value)}
                                    className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition"
                                    required
                                />
                            </div>

                            {/* Precio */}
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">Precio (CLP)</label>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">$</span>
                                    <input
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        value={formData.precio}
                                        onChange={(e) => handleInputChange("precio", Number(e.target.value))}
                                        className="w-full pl-10 pr-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition"
                                        required
                                    />
                                </div>
                            </div>

                            {/* Stock */}
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">Stock disponible</label>
                                <input
                                    type="number"
                                    min="0"
                                    value={formData.stock}
                                    onChange={(e) => handleInputChange("stock", Number(e.target.value))}
                                    className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition"
                                    required
                                />
                            </div>

                            {/* Etiqueta */}
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">Etiqueta (opcional)</label>
                                <input
                                    type="text"
                                    value={formData.etiqueta}
                                    onChange={(e) => handleInputChange("etiqueta", e.target.value)}
                                    className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition"
                                    placeholder="Ej: Nuevo, Oferta, etc."
                                />
                            </div>

                            {/* Descripción */}
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">Descripción</label>
                                <textarea
                                    value={formData.descripcion}
                                    onChange={(e) => handleInputChange("descripcion", e.target.value)}
                                    rows="4"
                                    className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition"
                                    placeholder="Describe las características del producto..."
                                />
                            </div>

                            {/* Botones */}
                            <div className="flex gap-3 pt-2">
                                <button
                                    type="submit"
                                    className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition shadow focus:outline-none focus:ring-2 focus:ring-red-500/40 flex-1"
                                >
                                    Guardar cambios
                                </button>

                                <button
                                    type="button"
                                    onClick={() => setEditingProduct(null)}
                                    className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white font-medium rounded-lg transition flex-1"
                                >
                                    Cancelar
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {toast && (
                <div className="fixed bottom-4 right-4 bg-green-600 text-white px-4 py-2 rounded shadow-lg animate-fade-in">
                    {toast}
                </div>
            )}
        </div>
    );
}