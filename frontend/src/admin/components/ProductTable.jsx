// frontend/src/admin/components/ProductTable.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Pencil, Trash2, Eye } from "lucide-react";
import useProducts from "../hooks/useProducts";
import { getImageUrl } from "../../utils/getImageUrl";

export default function ProductTable() {
    const { products, loading, deleteProduct } = useProducts();
    const navigate = useNavigate();
    const [loadingDelete, setLoadingDelete] = useState(null);

    const handleView = (id) => window.open(`/producto/${id}`, '_blank');
    const handleEdit = (id) => navigate(`/admin/products/edit/${id}`);

    const handleDelete = async (id, titulo) => {
        if (!confirm(`¿Seguro que deseas eliminar "${titulo}" y todas sus imágenes?\n\nEsta acción no se puede deshacer.`)) {
            return;
        }
        setLoadingDelete(id);
        try {
            await deleteProduct(id);
        } catch (error) {
            console.error("Error eliminando producto:", error);
            alert("❌ Error al eliminar el producto. Intenta de nuevo.");
        } finally {
            setLoadingDelete(null);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (!products || products.length === 0) {
        return (
            <div className="bg-background rounded-xl shadow-sm border border-border p-12 text-center">
                <p className="text-muted text-lg mb-4">No hay productos disponibles</p>
                <button
                    onClick={() => navigate("/admin/products/create")}
                    className="px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition"
                >
                    ➕ Crear primer producto
                </button>
            </div>
        );
    }

    return (
        <div className="bg-background rounded-xl shadow-sm border border-border overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead>
                        <tr className="bg-muted/20 border-b border-border">
                            <th className="px-6 py-4 text-left text-xs font-semibold text-muted uppercase tracking-wider">Imagen</th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-muted uppercase tracking-wider">Producto</th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-muted uppercase tracking-wider">Precio</th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-muted uppercase tracking-wider">Stock</th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-muted uppercase tracking-wider">Categoría</th>
                            <th className="px-6 py-4 text-center text-xs font-semibold text-muted uppercase tracking-wider">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                        {products.map((p) => (
                            <tr key={p.id} className="hover:bg-muted/10 transition">
                                {/* ✅ Imagen — usa getImageUrl para soportar Cloudinary y rutas relativas */}
                                <td className="px-6 py-4">
                                    {p.imagen_principal ? (
                                        <img
                                            src={getImageUrl(p.imagen_principal, 64, 64, 70)}
                                            alt={p.titulo}
                                            className="w-16 h-16 object-cover rounded-lg shadow-sm"
                                            onError={(e) => {
                                                e.target.src = "/placeholder.svg";
                                            }}
                                        />
                                    ) : (
                                        <div className="w-16 h-16 bg-muted/20 rounded-lg flex items-center justify-center">
                                            <span className="text-muted text-xs">Sin imagen</span>
                                        </div>
                                    )}
                                </td>

                                {/* Producto */}
                                <td className="px-6 py-4">
                                    <div className="flex flex-col">
                                        <span className="font-semibold text-foreground text-sm">{p.titulo}</span>
                                        {p.descripcion && (
                                            <span className="text-xs text-muted mt-1 line-clamp-2 max-w-xs">{p.descripcion}</span>
                                        )}
                                        <span className="text-xs text-muted mt-1">ID: {p.id}</span>
                                    </div>
                                </td>

                                {/* Precio */}
                                <td className="px-6 py-4">
                                    <div className="flex flex-col">
                                        <span className="font-bold text-foreground">
                                            ${Number(p.precio).toLocaleString('es-CL')}
                                        </span>
                                        {p.precio_anterior && (
                                            <span className="text-xs text-muted line-through">
                                                ${Number(p.precio_anterior).toLocaleString('es-CL')}
                                            </span>
                                        )}
                                    </div>
                                </td>

                                {/* Stock */}
                                <td className="px-6 py-4">
                                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${p.stock > 10 ? 'bg-green-100 text-green-800'
                                            : p.stock > 0 ? 'bg-yellow-100 text-yellow-800'
                                                : 'bg-red-100 text-red-800'
                                        }`}>
                                        {p.stock > 0 ? `${p.stock} unidades` : 'Agotado'}
                                    </span>
                                </td>

                                {/* Categoría */}
                                <td className="px-6 py-4">
                                    <span className="text-sm text-muted">{p.categoria_nombre || "—"}</span>
                                </td>

                                {/* Acciones */}
                                <td className="px-6 py-4">
                                    <div className="flex justify-center items-center gap-2">
                                        <button
                                            onClick={() => handleView(p.id)}
                                            className="p-2 text-muted hover:text-primary hover:bg-primary/10 rounded-lg transition-all"
                                            title="Ver en tienda"
                                        >
                                            <Eye className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => handleEdit(p.id)}
                                            className="p-2 text-muted hover:text-yellow-600 hover:bg-yellow-100 rounded-lg transition-all"
                                            title="Editar producto"
                                        >
                                            <Pencil className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(p.id, p.titulo)}
                                            disabled={loadingDelete === p.id}
                                            className="p-2 text-muted hover:text-red-600 hover:bg-red-100 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                            title="Eliminar producto"
                                        >
                                            {loadingDelete === p.id ? (
                                                <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></div>
                                            ) : (
                                                <Trash2 className="w-4 h-4" />
                                            )}
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <div className="bg-muted/20 px-6 py-4 border-t border-border">
                <p className="text-sm text-muted">
                    Total: <span className="font-semibold text-foreground">{products.length}</span> productos
                </p>
            </div>
        </div>
    );
}
