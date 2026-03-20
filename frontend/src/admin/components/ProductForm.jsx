// frontend/src/admin/components/ProductForm.jsx
import { useState, useEffect } from "react";
import { Package, DollarSign, Hash, Tag, FileText, Upload, X, Check, Loader } from "lucide-react";

export default function ProductForm({ initialData, onSubmit }) {
    const [formData, setFormData] = useState({
        nombre: "", precio: "", stock: "",
        categoria: "", descripcion: "",
    });
    const [files, setFiles] = useState([]);
    const [loading, setLoading] = useState(false);
    const isEditing = !!initialData;

    const inputClass = "w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-sky-500/50 focus:border-sky-500/50 transition-all duration-300";

    useEffect(() => {
        if (initialData) {
            setFormData({
                nombre: initialData.titulo || "",
                precio: initialData.precio || "",
                stock: initialData.stock || "",
                categoria: initialData.categoria_nombre || "",
                descripcion: initialData.descripcion || "",
            });
        }
    }, [initialData]);

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
    const handleFileChange = (e) => setFiles(Array.from(e.target.files));
    const removeFile = (i) => setFiles(prev => prev.filter((_, idx) => idx !== i));

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const fd = new FormData();
            fd.append('nombre', formData.nombre);
            fd.append('titulo', formData.nombre);
            fd.append('precio', formData.precio);
            fd.append('stock', formData.stock);
            fd.append('categoria', formData.categoria);
            fd.append('descripcion', formData.descripcion);
            files.forEach(f => fd.append('imagenes', f));
            await onSubmit(fd);
        } catch {
            alert("Error al guardar el producto");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-gray-900/80 rounded-2xl border border-gray-800 shadow-xl overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-800 flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-sky-500/10 flex items-center justify-center">
                    <Package className="w-5 h-5 text-sky-400" />
                </div>
                <div>
                    <h3 className="font-bold text-white">{isEditing ? "Editar Producto" : "Nuevo Producto"}</h3>
                    <p className="text-xs text-gray-500">{isEditing ? "Modifica los datos del producto" : "Completa los campos para crear"}</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">

                {/* Info general */}
                <div className="space-y-4">
                    <div className="flex items-center gap-2 pb-2 border-b border-gray-800">
                        <Package className="w-4 h-4 text-gray-500" />
                        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Información</span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="text-xs text-gray-400 font-medium mb-1.5 flex items-center gap-1.5 uppercase tracking-wider">
                                <Package className="w-3 h-3" /> Nombre
                            </label>
                            <input type="text" name="nombre" value={formData.nombre} onChange={handleChange}
                                placeholder="Nombre del producto" className={inputClass} required />
                        </div>
                        <div>
                            <label className="text-xs text-gray-400 font-medium mb-1.5 flex items-center gap-1.5 uppercase tracking-wider">
                                <Tag className="w-3 h-3" /> Categoría
                            </label>
                            <input type="text" name="categoria" value={formData.categoria} onChange={handleChange}
                                placeholder="Ej: Decoración" className={inputClass} />
                        </div>
                        <div className="md:col-span-2">
                            <label className="text-xs text-gray-400 font-medium mb-1.5 flex items-center gap-1.5 uppercase tracking-wider">
                                <FileText className="w-3 h-3" /> Descripción
                            </label>
                            <textarea name="descripcion" value={formData.descripcion} onChange={handleChange}
                                rows="3" placeholder="Describe el producto..." className={`${inputClass} resize-none`} />
                        </div>
                    </div>
                </div>

                {/* Precio y stock */}
                <div className="space-y-4">
                    <div className="flex items-center gap-2 pb-2 border-b border-gray-800">
                        <DollarSign className="w-4 h-4 text-gray-500" />
                        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Precio e Inventario</span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="text-xs text-gray-400 font-medium mb-1.5 flex items-center gap-1.5 uppercase tracking-wider">
                                <DollarSign className="w-3 h-3" /> Precio (CLP)
                            </label>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-sm">$</span>
                                <input type="number" name="precio" value={formData.precio} onChange={handleChange}
                                    placeholder="0" className={`${inputClass} pl-8`} required min="0" />
                            </div>
                        </div>
                        <div>
                            <label className="text-xs text-gray-400 font-medium mb-1.5 flex items-center gap-1.5 uppercase tracking-wider">
                                <Hash className="w-3 h-3" /> Stock
                            </label>
                            <input type="number" name="stock" value={formData.stock} onChange={handleChange}
                                placeholder="0" className={inputClass} required min="0" />
                        </div>
                    </div>
                </div>

                {/* Imágenes */}
                <div className="space-y-4">
                    <div className="flex items-center gap-2 pb-2 border-b border-gray-800">
                        <Upload className="w-4 h-4 text-gray-500" />
                        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                            Imágenes {isEditing && <span className="normal-case text-gray-600">(deja vacío para mantener las actuales)</span>}
                        </span>
                    </div>
                    <div className="relative">
                        <input type="file" accept="image/*" multiple onChange={handleFileChange}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                        <div className="px-4 py-5 bg-gray-800/50 border-2 border-dashed border-gray-700 rounded-xl hover:border-sky-500/40 hover:bg-gray-800 transition-all group">
                            <div className="flex items-center justify-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-gray-700 group-hover:bg-sky-500/10 flex items-center justify-center transition-colors">
                                    <Upload className="w-5 h-5 text-gray-400 group-hover:text-sky-400 transition-colors" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-300 font-medium">Haz clic para subir imágenes</p>
                                    <p className="text-xs text-gray-500">PNG, JPG, WEBP — Máx. 5MB</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    {files.length > 0 && (
                        <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
                            {files.map((f, i) => (
                                <div key={i} className="relative group">
                                    <img src={URL.createObjectURL(f)} alt="" className="w-full h-20 object-cover rounded-lg border border-gray-700" />
                                    <button type="button" onClick={() => removeFile(i)}
                                        className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                        <X className="w-3 h-3 text-white" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Botones */}
                <div className="flex gap-3 pt-2 border-t border-gray-800">
                    <button type="submit" disabled={loading}
                        className="flex-1 py-3 bg-gradient-to-r from-sky-500 to-sky-600 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-sky-500/20 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 disabled:opacity-60 text-sm">
                        {loading
                            ? <><Loader className="w-4 h-4 animate-spin" /><span>Guardando...</span></>
                            : <><Check className="w-4 h-4" /><span>{isEditing ? "Guardar cambios" : "Crear producto"}</span></>
                        }
                    </button>
                </div>
            </form>
        </div>
    );
}
