import { useState, useRef } from "react";
import api from "../../services/api";
import { Package, DollarSign, Hash, Tag, FileText, Image, Upload, X, Check, Loader } from "lucide-react";

export default function AddProductForm() {
    const formRef = useRef(null);
    const [form, setForm] = useState({
        nombre: "",
        precio: "",
        stock: "",
        categoria: "",
        descripcion: "",
        imagenUrl: "",
    });

    const [imagenes, setImagenes] = useState([]);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState(null); // Cambio: solo guardar tipo y texto

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleFileChange = (e) => {
        const files = Array.from(e.target.files);
        if (files.length > 0) {
            setImagenes(files);
        }
    };

    const removeImage = (index) => {
        setImagenes(prev => prev.filter((_, i) => i !== index));
    };

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

            if (imagenes.length > 0) {
                imagenes.forEach((img) => {
                    data.append("imagenes", img);
                });
            } else if (form.imagenUrl) {
                data.append("imagenUrl", form.imagenUrl);
            }

            await api.post("/admin/productos", data, {
                headers: { "Content-Type": "multipart/form-data" },
            });

            setForm({ nombre: "", precio: "", stock: "", categoria: "", descripcion: "", imagenUrl: "" });
            setImagenes([]);
            setMessage({
                type: "success",
                text: "✅ Producto creado correctamente"
            });

            if (formRef.current) {
                formRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }

            setTimeout(() => {
                setMessage(null);
            }, 3000);

        } catch (error) {
            console.error(error);
            setMessage({
                type: "error",
                text: "❌ Error al crear producto"
            });
            setTimeout(() => {
                setMessage(null);
            }, 5000);
        } finally {
            setLoading(false);
        }
    };

    // Estilo base para inputs
    const inputClassName = "w-full px-4 py-3 bg-secondary/20 border border-border/50 rounded-xl focus:ring-2 focus:ring-accent/30 focus:border-accent/50 transition-all duration-300 text-foreground placeholder:text-muted-foreground/60";

    return (
        <div ref={formRef} className="bg-gradient-to-br from-background via-background/95 to-background rounded-2xl border border-border/50 shadow-xl p-6 md:p-8">
            {/* Header del formulario */}
            <div className="flex items-center gap-3 mb-8">
                <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center">
                    <Package className="w-6 h-6 text-accent" />
                </div>
                <div>
                    <h3 className="text-2xl font-bold mb-1">
                        <span className="bg-gradient-to-r from-foreground via-foreground/90 to-foreground/80 bg-clip-text text-transparent">
                            Nuevo Producto
                        </span>
                    </h3>
                    <p className="text-lg text-muted-foreground">Completa todos los campos para agregar un producto</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
                {/* Sección: Información General */}
                <div className="space-y-6">
                    <div className="flex items-center gap-3 pb-4 border-b border-border/50">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                            <Package className="w-4 h-4 text-primary" />
                        </div>
                        <h4 className="font-semibold text-foreground text-lg">Información General</h4>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-2">
                                <Package className="w-4 h-4" />
                                Nombre del producto
                            </label>
                            <input
                                type="text"
                                name="nombre"
                                value={form.nombre}
                                onChange={handleChange}
                                placeholder="Ej: Gato Egipcio Bastet"
                                className={inputClassName}
                                required
                            />
                        </div>

                        <div>
                            <label className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-2">
                                <Tag className="w-4 h-4" />
                                Categoría
                            </label>
                            <input
                                type="text"
                                name="categoria"
                                value={form.categoria}
                                onChange={handleChange}
                                placeholder="Ej: Decoración"
                                className={inputClassName}
                            />
                        </div>

                        <div className="md:col-span-2">
                            <label className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-2">
                                <FileText className="w-4 h-4" />
                                Descripción detallada
                            </label>
                            <textarea
                                name="descripcion"
                                value={form.descripcion}
                                onChange={handleChange}
                                rows="4"
                                placeholder="Describe las características principales, materiales, dimensiones, etc..."
                                className={`${inputClassName} resize-none`}
                            />
                        </div>
                    </div>
                </div>

                {/* Sección: Inventario y Precio */}
                <div className="space-y-6">
                    <div className="flex items-center gap-3 pb-4 border-b border-border/50">
                        <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center">
                            <DollarSign className="w-4 h-4 text-emerald-500" />
                        </div>
                        <h4 className="font-semibold text-foreground text-lg">Inventario y Precio</h4>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-2">
                                <DollarSign className="w-4 h-4" />
                                Precio ($)
                            </label>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground">$</span>
                                <input
                                    type="number"
                                    name="precio"
                                    value={form.precio}
                                    onChange={handleChange}
                                    placeholder="0.00"
                                    className={`${inputClassName} pl-10`}
                                    required
                                    min="0"
                                    step="0.01"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-2">
                                <Hash className="w-4 h-4" />
                                Stock disponible
                            </label>
                            <input
                                type="number"
                                name="stock"
                                value={form.stock}
                                onChange={handleChange}
                                placeholder="Cantidad"
                                className={inputClassName}
                                required
                                min="0"
                            />
                        </div>
                    </div>
                </div>

                {/* Sección: Multimedia */}
                <div className="space-y-6">
                    <div className="flex items-center gap-3 pb-4 border-b border-border/50">
                        <div className="w-8 h-8 rounded-full bg-purple-500/10 flex items-center justify-center">
                            <Image className="w-4 h-4 text-purple-500" />
                        </div>
                        <h4 className="font-semibold text-foreground text-lg">Multimedia</h4>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-2">
                                <Image className="w-4 h-4" />
                                URL de Imagen
                            </label>
                            <input
                                type="text"
                                name="imagenUrl"
                                value={form.imagenUrl}
                                onChange={handleChange}
                                placeholder="https://ejemplo.com/imagen.jpg"
                                className={inputClassName}
                            />
                        </div>

                        <div>
                            <label className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-2">
                                <Upload className="w-4 h-4" />
                                Cargar archivos
                            </label>
                            <div className="relative">
                                <input
                                    type="file"
                                    accept="image/*"
                                    multiple
                                    onChange={handleFileChange}
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                />
                                <div className="px-4 py-3 bg-secondary/20 border-2 border-dashed border-border/50 rounded-xl hover:border-accent/50 hover:bg-secondary/30 transition-all duration-300 group">
                                    <div className="flex items-center justify-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                                            <Upload className="w-5 h-5 text-accent" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-foreground">Haz clic para subir imágenes</p>
                                            <p className="text-xs text-muted-foreground">PNG, JPG, WEBP (Máx. 5MB por imagen)</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Previsualización de imágenes */}
                    {imagenes.length > 0 && (
                        <div className="mt-6">
                            <div className="flex items-center gap-2 mb-4">
                                <span className="text-sm font-medium text-muted-foreground">Vista previa:</span>
                                <span className="text-xs bg-accent/10 text-accent px-2 py-1 rounded-full">
                                    {imagenes.length} imagen{imagenes.length !== 1 ? 'es' : ''}
                                </span>
                            </div>
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                                {imagenes.map((img, index) => (
                                    <div key={index} className="relative group">
                                        <img
                                            src={URL.createObjectURL(img)}
                                            alt={`Preview ${index + 1}`}
                                            className="w-full h-32 object-cover rounded-xl border-2 border-border/50 group-hover:border-accent/50 transition-all duration-300"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => removeImage(index)}
                                            className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:scale-110"
                                        >
                                            <X className="w-3 h-3" />
                                        </button>
                                        <div className="absolute bottom-2 left-2 right-2 bg-black/60 backdrop-blur-sm rounded-lg px-2 py-1">
                                            <p className="text-xs text-white truncate">{img.name}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Mensaje de estado */}
                {message && (
                    <div className={`p-4 rounded-xl border ${message.type === 'success'
                        ? 'bg-gradient-to-r from-emerald-500/10 to-emerald-600/10 border-emerald-500/20'
                        : 'bg-gradient-to-r from-red-500/10 to-red-600/10 border-red-500/20'
                        }`}>
                        <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${message.type === 'success' ? 'bg-emerald-500/20 text-emerald-500' : 'bg-red-500/20 text-red-500'
                                }`}>
                                {message.type === 'success' ? <Check className="w-5 h-5" /> : <X className="w-5 h-5" />}
                            </div>
                            <div>
                                <p className={`font-medium ${message.type === 'success' ? 'text-emerald-400' : 'text-red-400'}`}>
                                    {message.text}
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Botones de acción */}
                <div className="flex flex-col sm:flex-row justify-end gap-4 pt-6 border-t border-border/50">
                    <button
                        type="button"
                        onClick={() => {
                            setForm({ nombre: "", precio: "", stock: "", categoria: "", descripcion: "", imagenUrl: "" });
                            setImagenes([]);
                            setMessage(null);
                        }}
                        className="px-6 py-3 rounded-xl font-medium border border-border hover:bg-secondary/20 transition-all duration-300 text-foreground"
                    >
                        Limpiar formulario
                    </button>
                    <button
                        type="submit"
                        disabled={loading}
                        className="group relative px-8 py-3 bg-gradient-to-r from-sky-500 to-sky-600 text-white font-semibold rounded-xl transition-all duration-300 flex items-center justify-center gap-2 overflow-hidden hover:shadow-xl hover:shadow-sky-500/30 hover:-translate-y-1 disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {loading ? (
                            <>
                                <Loader className="w-5 h-5 animate-spin" />
                                <span>Procesando...</span>
                            </>
                        ) : (
                            <>
                                <Check className="w-5 h-5 relative z-10 group-hover:scale-110 transition-transform" />
                                <span className="relative z-10">Guardar Producto</span>
                                <div className="absolute inset-0 bg-gradient-to-r from-sky-600 to-sky-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
}