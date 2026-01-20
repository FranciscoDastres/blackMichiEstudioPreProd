// ProductForm.jsx
import { useState, useEffect } from "react";

export default function ProductForm({ product, onSubmit, onCancel, isEditing = false }) {
    const [formData, setFormData] = useState({
        nombre: "",
        precio: "",
        stock: "",
        categoria: "",
        descripcion: "",
        imagenUrl: ""
    });
    const [files, setFiles] = useState([]);

    useEffect(() => {
        if (product) {
            setFormData({
                nombre: product.titulo || "",
                precio: product.precio || "",
                stock: product.stock || "",
                categoria: product.categoria_id || "",
                descripcion: product.descripcion || "",
                imagenUrl: product.imagen_principal || ""
            });
        }
    }, [product]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        const { nombre, precio, stock, categoria, descripcion } = formData;
        const formDataToSend = new FormData();
        formDataToSend.append('nombre', nombre);
        formDataToSend.append('precio', precio);
        formDataToSend.append('stock', stock);
        formDataToSend.append('categoria', categoria);
        formDataToSend.append('descripcion', descripcion);

        if (files.length > 0) {
            files.forEach(file => {
                formDataToSend.append('images', file);
            });
        }

        try {
            await onSubmit(formDataToSend);
            alert("Producto guardado correctamente");
        } catch (err) {
            alert("Error al guardar el producto");
        }
    };

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleFileChange = (e) => {
        setFiles(Array.from(e.target.files));
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6 bg-background p-6 rounded-xl border border-border">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-medium text-muted mb-2">Nombre del producto</label>
                    <input
                        type="text"
                        name="nombre"
                        value={formData.nombre}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                        required
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-muted mb-2">Categoría</label>
                    <input
                        type="text"
                        name="categoria"
                        value={formData.categoria}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-muted mb-2">Precio ($)</label>
                    <input
                        type="number"
                        name="precio"
                        value={formData.precio}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                        required
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-muted mb-2">Stock</label>
                    <input
                        type="number"
                        name="stock"
                        value={formData.stock}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                        required
                    />
                </div>

                <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-muted mb-2">Descripción</label>
                    <textarea
                        name="descripcion"
                        value={formData.descripcion}
                        onChange={handleChange}
                        rows="4"
                        className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                </div>

                <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-muted mb-2">Imágenes</label>
                    <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleFileChange}
                        className="w-full text-sm text-muted file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
                    />
                </div>
            </div>

            <div className="flex justify-end gap-3 pt-4">
                <button
                    type="button"
                    onClick={onCancel}
                    className="px-4 py-2 text-muted hover:bg-muted/20 rounded-lg transition"
                >
                    Cancelar
                </button>
                <button
                    type="submit"
                    className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition"
                >
                    {isEditing ? "Actualizar Producto" : "Crear Producto"}
                </button>
            </div>
        </form>
    );
}