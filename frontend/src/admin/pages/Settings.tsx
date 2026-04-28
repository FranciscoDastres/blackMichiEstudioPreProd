import { useState, useEffect } from "react";
import api from "../../services/api";
import { Save, Image, Type, Tag, Text, Upload } from "lucide-react";

type SectionKey = "section1" | "section2" | "section3" | "section4" | "section5" | "section6";

interface SectionFormData {
    title: string;
    subtitle: string;
    buttonText: string;
    categoria: string;
}

type SectionImages = Record<SectionKey, File | null>;
type SectionFormDataMap = Record<SectionKey, SectionFormData>;
type SectionPreviews = Record<SectionKey, string | null>;

interface Message {
    type: "success" | "error";
    text: string;
}

const SECTION_KEYS: SectionKey[] = ["section1", "section2", "section3", "section4", "section5", "section6"];

const defaultFormData = (): SectionFormDataMap =>
    Object.fromEntries(
        SECTION_KEYS.map((k) => [k, { title: "", subtitle: "", buttonText: "Ver Colección", categoria: "" }])
    ) as SectionFormDataMap;

const defaultPreviews = (): SectionPreviews =>
    Object.fromEntries(SECTION_KEYS.map((k) => [k, null])) as SectionPreviews;

export default function Settings() {
    const [heroImages, setHeroImages] = useState<SectionImages>(
        Object.fromEntries(SECTION_KEYS.map((k) => [k, null])) as SectionImages
    );
    const [formData, setFormData] = useState<SectionFormDataMap>(defaultFormData());
    const [previews, setPreviews] = useState<SectionPreviews>(defaultPreviews());
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<Message | null>(null);

    useEffect(() => {
        fetchHeroImages();
    }, []);

    const fetchHeroImages = async () => {
        try {
            const { data } = await api.get<Record<SectionKey, { image_url?: string; title?: string; subtitle?: string; button_text?: string; categoria?: string }>>("/hero-images");

            const newPreviews: SectionPreviews = defaultPreviews();
            const newFormData: SectionFormDataMap = defaultFormData();

            SECTION_KEYS.forEach((key) => {
                if (data[key]) {
                    const section = data[key];
                    newPreviews[key] = section.image_url || null;
                    newFormData[key] = {
                        title: section.title || "",
                        subtitle: section.subtitle || "",
                        buttonText: section.button_text || "Ver Colección",
                        categoria: section.categoria || "",
                    };
                }
            });

            setPreviews(newPreviews);
            setFormData(newFormData);
        } catch (err) {
            console.error("Error cargando imágenes:", err);
            setPreviews(defaultPreviews());
            setFormData(defaultFormData());
        }
    };

    const handleFileChange = (section: SectionKey, file: File | null) => {
        if (file) {
            setHeroImages((prev) => ({ ...prev, [section]: file }));
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviews((prev) => ({ ...prev, [section]: reader.result as string }));
            };
            reader.readAsDataURL(file);
        }
    };

    const handleInputChange = (section: SectionKey, field: keyof SectionFormData, value: string) => {
        setFormData((prev) => ({
            ...prev,
            [section]: { ...prev[section], [field]: value },
        }));
    };

    const handleUpload = async (section: SectionKey) => {
        if (!heroImages[section] && !formData[section].title) {
            setMessage({ type: "error", text: "Selecciona una imagen o actualiza los textos" });
            return;
        }

        setLoading(true);
        setMessage(null);

        try {
            const formDataToSend = new FormData();
            if (heroImages[section]) {
                formDataToSend.append("image", heroImages[section]!);
            }
            formDataToSend.append("section", section);
            formDataToSend.append("title", formData[section].title);
            formDataToSend.append("subtitle", formData[section].subtitle);
            formDataToSend.append("buttonText", formData[section].buttonText);
            formDataToSend.append("categoria", formData[section].categoria);

            const { data } = await api.post<{ data?: { image_url?: string } }>("/hero-images", formDataToSend, {
                headers: { "Content-Type": "multipart/form-data" },
            });

            setMessage({
                type: "success",
                text: `✅ Sección ${section.replace("section", "")} actualizada correctamente`,
            });
            setHeroImages((prev) => ({ ...prev, [section]: null }));

            if (data?.data?.image_url) {
                setPreviews((prev) => ({ ...prev, [section]: data.data!.image_url! }));
            }
        } catch (err) {
            console.error("Error subiendo:", err);
            setMessage({ type: "error", text: "❌ Error al actualizar. Verifica los datos e inténtalo nuevamente." });
        } finally {
            setLoading(false);
            setTimeout(() => setMessage(null), 3000);
        }
    };

    const sections: { key: SectionKey; label: string; color: string }[] = [
        { key: "section1", label: "Sección 1 - Hero Principal", color: "from-sky-500/10 to-sky-600/10" },
        { key: "section2", label: "Sección 2 - Hero Secundario", color: "from-purple-500/10 to-purple-600/10" },
        { key: "section3", label: "Sección 3 - Hero Adicional", color: "from-emerald-500/10 to-emerald-600/10" },
        { key: "section4", label: "Sección 4 - Hero Principal", color: "from-amber-500/10 to-amber-600/10" },
        { key: "section5", label: "Sección 5 - Hero Secundario", color: "from-rose-500/10 to-rose-600/10" },
        { key: "section6", label: "Sección 6 - Hero Adicional", color: "from-indigo-500/10 to-indigo-600/10" },
    ];

    return (
        <div className="space-y-8 p-4 sm:p-6 bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 min-h-screen">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl md:text-4xl font-bold mb-2">
                    <span className="bg-gradient-to-r from-foreground via-foreground/90 to-foreground/80 bg-clip-text text-transparent">
                        Configuración Hero Section (6 Secciones)
                    </span>
                </h1>
                <p className="text-lg text-muted-foreground">
                    Gestiona las imágenes y textos del carousel principal de tu tienda
                </p>
            </div>

            {/* Mensaje de estado */}
            {message && (
                <div className={`p-4 rounded-2xl border ${message.type === "success"
                    ? "bg-gradient-to-r from-emerald-500/10 to-emerald-600/10 border-emerald-500/20 text-emerald-400"
                    : "bg-gradient-to-r from-red-500/10 to-red-600/10 border-red-500/20 text-red-400"
                    }`}>
                    <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${message.type === "success" ? "bg-emerald-500 animate-pulse" : "bg-red-500 animate-pulse"}`}></div>
                        <span className="font-medium">{message.text}</span>
                    </div>
                </div>
            )}

            {/* Secciones */}
            <div className="space-y-8">
                {sections.map(({ key, label, color }) => (
                    <div key={key} className={`bg-gradient-to-br from-background via-background/95 to-background rounded-2xl border border-border/50 shadow-xl p-6 md:p-8 ${color}`}>
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center">
                                <Image className="w-5 h-5 text-accent" />
                            </div>
                            <h3 className="text-xl font-bold text-foreground">{label}</h3>
                        </div>

                        {/* Preview */}
                        {previews[key] && (
                            <div className="mb-6">
                                <div className="flex items-center gap-2 mb-3">
                                    <span className="text-sm font-medium text-muted-foreground">Vista previa:</span>
                                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-accent/10 border border-accent/20">
                                        <div className="w-2 h-2 rounded-full bg-accent animate-pulse"></div>
                                        <span className="text-xs font-medium text-accent">Imagen activa</span>
                                    </span>
                                </div>
                                <div className="relative group">
                                    <img
                                        src={previews[key]!}
                                        alt={label}
                                        className="w-full h-64 object-cover rounded-xl border-2 border-border/50 shadow-lg group-hover:scale-[1.02] transition-transform duration-300"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-background/60 to-transparent rounded-xl pointer-events-none"></div>
                                </div>
                            </div>
                        )}

                        {/* Formulario */}
                        <div className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-2">
                                        <Type className="w-4 h-4" />
                                        Título
                                    </label>
                                    <input
                                        type="text"
                                        value={formData[key]?.title || ""}
                                        onChange={(e) => handleInputChange(key, "title", e.target.value)}
                                        className="w-full px-4 py-3 bg-background/50 border border-border/50 rounded-xl focus:ring-2 focus:ring-accent/30 focus:border-accent/50 transition-all duration-300"
                                        placeholder="Ej: Vasos 3D Personalizados"
                                    />
                                </div>

                                <div>
                                    <label className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-2">
                                        <Tag className="w-4 h-4" />
                                        Categoría (slug)
                                    </label>
                                    <input
                                        type="text"
                                        value={formData[key]?.categoria || ""}
                                        onChange={(e) => handleInputChange(key, "categoria", e.target.value)}
                                        className="w-full px-4 py-3 bg-background/50 border border-border/50 rounded-xl focus:ring-2 focus:ring-accent/30 focus:border-accent/50 transition-all duration-300"
                                        placeholder="Ej: vasos3d"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-2">
                                    <Text className="w-4 h-4" />
                                    Subtítulo / Descripción
                                </label>
                                <textarea
                                    value={formData[key]?.subtitle || ""}
                                    onChange={(e) => handleInputChange(key, "subtitle", e.target.value)}
                                    rows={2}
                                    className="w-full px-4 py-3 bg-background/50 border border-border/50 rounded-xl focus:ring-2 focus:ring-accent/30 focus:border-accent/50 transition-all duration-300 resize-none"
                                    placeholder="Ej: Diseños únicos y coloridos para tu bebida favorita"
                                />
                            </div>

                            <div>
                                <label className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-2">
                                    <Type className="w-4 h-4" />
                                    Texto del Botón
                                </label>
                                <input
                                    type="text"
                                    value={formData[key]?.buttonText || ""}
                                    onChange={(e) => handleInputChange(key, "buttonText", e.target.value)}
                                    className="w-full px-4 py-3 bg-background/50 border border-border/50 rounded-xl focus:ring-2 focus:ring-accent/30 focus:border-accent/50 transition-all duration-300"
                                    placeholder="Ej: Ver Colección"
                                />
                            </div>

                            {/* Upload de imagen */}
                            <div>
                                <label className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-2">
                                    <Upload className="w-4 h-4" />
                                    Imagen
                                </label>
                                <div className="relative">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => handleFileChange(key, e.target.files?.[0] ?? null)}
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                    />
                                    <div className="px-4 py-3 bg-background/50 border-2 border-dashed border-border/50 rounded-xl hover:border-accent/50 hover:bg-background/80 transition-all duration-300 group">
                                        <div className="flex items-center justify-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                                                <Upload className="w-5 h-5 text-accent" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-foreground">Haz clic para subir una imagen</p>
                                                <p className="text-xs text-muted-foreground">PNG, JPG, WEBP (Max. 5MB)</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Botón Guardar */}
                            <div className="pt-4">
                                <button
                                    onClick={() => handleUpload(key)}
                                    disabled={loading}
                                    className={`group relative w-full md:w-auto px-8 py-3 bg-gradient-to-r from-sky-500 to-sky-600 text-white font-semibold rounded-xl transition-all duration-300 flex items-center justify-center gap-2 overflow-hidden ${loading ? "opacity-70 cursor-not-allowed" : "hover:shadow-xl hover:shadow-sky-500/30 hover:-translate-y-1"
                                        }`}
                                >
                                    {loading ? (
                                        <>
                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                            <span>Actualizando...</span>
                                        </>
                                    ) : (
                                        <>
                                            <Save className="w-4 h-4 relative z-10 group-hover:scale-110 transition-transform" />
                                            <span className="relative z-10">Guardar Cambios</span>
                                            <div className="absolute inset-0 bg-gradient-to-r from-sky-600 to-sky-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
