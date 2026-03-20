// frontend/src/admin/components/AddProductForm.jsx
import { useState, useRef } from "react";
import { useProducts } from "../contexts/ProductsContext";
import { Package, DollarSign, Hash, Tag, FileText, Image, Upload, X, Check, Loader } from "lucide-react";

export default function AddProductForm() {
    const formRef = useRef(null);
    const { fetchProducts } = useProducts();
    const [form, setForm] = useState({
        nombre: "", precio: "", stock: "",
        categoria: "", descripcion: "",
    });
    const [imagenes, setImagenes] = useState([]);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState(null);

    const inputClass = "w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-sky-500/50 focus:border-sky-500/50 transition-all duration-300";

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const handleFileChange = (e) => {
        const files = Array.from(e.target.files);
        if (files.length > 0) setImagenes(files);
    };

    const removeImage = (index) => setImagenes(prev => prev.filter((_, i) => i !== index));

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage(null);
        try {
            const data = new FormData();
            data.append("nombre", form.nombre);
            data.append("descripcion", form.descripcion);
            data.append("precio", form.precio);
            data.append("stock", form.stock);
            data.append("categoria", form.categoria);
            imagenes.forEach((img) => data.append("imagenes", img));

            const token = localStorage.getItem("token");
            await fetch(`${import.meta.env.VITE_API_URL}/api/admin/productos`, {
                method: "POST",
                headers: { Authorization: `Bearer ${token}` },
                body: data,
            }).then(r => { if (!r.ok) throw new Error(); return r.json(); });

            setForm({ nombre: "", precio: "", stock: "", categoria: "", descripcion: "" });
            setImagenes([]);
            setMessage({ type: "success", text: "Producto creado correctamente" });
            await fetchProducts(); // ✅ Actualizar lista del contexto
            formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
            setTimeout(() => setMessage(null), 3000);
        } catch {
            setMessage({ type: "error", text: "Error al crear producto" });
            setTimeout(() => setMessage(null), 5000);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div ref={formRef}>
            <form onSubmit={handleSubmit} className="space-y-8">

                {/* Información General */}
                <div className="space-y-5">
                    <div className="flex items-center gap-3 pb-3 border-b border-gray-700">
                        <div className="w-7 h-7 rounded-lg bg-sky-500/10 flex items-center justify-center">
                            <Package className="w-4 h-4 text-sky-400" />
                        </div>
                        <h4 className="font-semibold text-gray-200">Información General</h4>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div>
                            <label className="flex items-center gap-2 text-xs font-medium text-gray-400 mb-2 uppercase tracking-wider">
                                <Package className="w-3.5 h-3.5" /> Nombre
                            </label>
                            <input type="text" name="nombre" value={form.nombre} onChange={handleChange}
                                placeholder="Ej: Gato Egipcio Bastet" className={inputClass} required />
                        </div>
                        <div>
                            <label className="flex items-center gap-2 text-xs font-medium text-gray-400 mb-2 uppercase tracking-wider">
                                <Tag className="w-3.5 h-3.5" /> Categoría
                            </label>
                            <input type="text" name="categoria" value={form.categoria} onChange={handleChange}
                                placeholder="Ej: Decoración" className={inputClass} />
                        </div>
                        <div className="md:col-span-2">
                            <label className="flex items-center gap-2 text-xs font-medium text-gray-400 mb-2 uppercase tracking-wider">
                                <FileText className="w-3.5 h-3.5" /> Descripción
                            </label>
                            <textarea name="descripcion" value={form.descripcion} onChange={handleChange}
                                rows="3" placeholder="Describe las características principales..."
                                className={`${inputClass} resize-none`} />
                        </div>
                    </div>
                </div>

                {/* Precio y Stock */}
                <div className="space-y-5">
                    <div className="flex items-center gap-3 pb-3 border-b border-gray-700">
                        <div className="w-7 h-7 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                            <DollarSign className="w-4 h-4 text-emerald-400" />
                        </div>
                        <h4 className="font-semibold text-gray-200">Precio e Inventario</h4>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div>
                            <label className="flex items-center gap-2 text-xs font-medium text-gray-400 mb-2 uppercase tracking-wider">
                                <DollarSign className="w-3.5 h-3.5" /> Precio (CLP)
                            </label>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                                <input type="number" name="precio" value={form.precio} onChange={handleChange}
                                    placeholder="0" className={`${inputClass} pl-8`} required min="0" />
                            </div>
                        </div>
                        <div>
                            <label className="flex items-center gap-2 text-xs font-medium text-gray-400 mb-2 uppercase tracking-wider">
                                <Hash className="w-3.5 h-3.5" /> Stock
                            </label>
                            <input type="number" name="stock" value={form.stock} onChange={handleChange}
                                placeholder="0" className={inputClass} required min="0" />
                        </div>
                    </div>
                </div>

                {/* Imágenes */}
                <div className="space-y-5">
                    <div className="flex items-center gap-3 pb-3 border-b border-gray-700">
                        <div className="w-7 h-7 rounded-lg bg-purple-500/10 flex items-center justify-center">
                            <Image className="w-4 h-4 text-purple-400" />
                        </div>
                        <h4 className="font-semibold text-gray-200">Imágenes</h4>
                    </div>
                    <div className="relative">
                        <input type="file" accept="image/*" multiple onChange={handleFileChange}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                        <div className="px-4 py-6 bg-gray-800/50 border-2 border-dashed border-gray-700 rounded-xl hover:border-sky-500/50 hover:bg-gray-800 transition-all duration-300 group">
                            <div className="flex flex-col items-center gap-2 text-center">
                                <div className="w-12 h-12 rounded-full bg-gray-700 flex items-center justify-center group-hover:bg-sky-500/10 transition-colors">
                                    <Upload className="w-6 h-6 text-gray-400 group-hover:text-sky-400 transition-colors" />
                                </div>
                                <p className="text-sm font-medium text-gray-300">Arrastra o haz clic para subir</p>
                                <p className="text-xs text-gray-500">PNG, JPG, WEBP — Máx. 5MB por imagen</p>
                            </div>
                        </div>
                    </div>

                    {imagenes.length > 0 && (
                        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
                            {imagenes.map((img, i) => (
                                <div key={i} className="relative group">
                                    <img src={URL.createObjectURL(img)} alt={`Preview ${i + 1}`}
                                        className="w-full h-24 object-cover rounded-xl border border-gray-700 group-hover:border-sky-500/50 transition-all" />
                                    <button type="button" onClick={() => removeImage(i)}
                                        className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600">
                                        <X className="w-3 h-3" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Mensaje */}
                {message && (
                    <div className={`p-4 rounded-xl flex items-center gap-3 ${message.type === 'success'
                            ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400'
                            : 'bg-red-500/10 border border-red-500/20 text-red-400'
                        }`}>
                        {message.type === 'success' ? <Check className="w-5 h-5 flex-shrink-0" /> : <X className="w-5 h-5 flex-shrink-0" />}
                        <span className="text-sm font-medium">{message.text}</span>
                    </div>
                )}

                {/* Botones */}
                <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4 border-t border-gray-700">
                    <button type="button"
                        onClick={() => { setForm({ nombre: "", precio: "", stock: "", categoria: "", descripcion: "" }); setImagenes([]); setMessage(null); }}
                        className="px-5 py-2.5 rounded-xl font-medium border border-gray-700 hover:bg-gray-800 transition-all text-gray-300 text-sm">
                        Limpiar
                    </button>
                    <button type="submit" disabled={loading}
                        className="group relative px-7 py-2.5 bg-gradient-to-r from-sky-500 to-sky-600 text-white font-semibold rounded-xl transition-all duration-300 flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-sky-500/25 hover:-translate-y-0.5 disabled:opacity-60 disabled:cursor-not-allowed text-sm">
                        {loading ? (
                            <><Loader className="w-4 h-4 animate-spin" /><span>Guardando...</span></>
                        ) : (
                            <><Check className="w-4 h-4" /><span>Guardar Producto</span></>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
}
