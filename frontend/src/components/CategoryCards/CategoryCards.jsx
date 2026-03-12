// CategoryCards.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";

function CategoryCards() {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const navigate = useNavigate();

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                console.log('🔍 Cargando categorías...');
                const response = await api.get("/categorias");

                // ✅ Validar que es un array
                const data = Array.isArray(response.data) ? response.data : [];
                console.log('✅ Categorías cargadas:', data.length);

                setCategories(data);
                setError(null);
            } catch (err) {
                console.error('❌ Error cargando categorías:', err);
                setError("Error al cargar categorías");

                // ✅ Fallback con categorías por defecto
                setCategories([
                    { id: 1, nombre: "Vasos 3D" },
                    { id: 2, nombre: "Placas Navi" },
                    { id: 3, nombre: "Figuras" }
                ]);
            } finally {
                setLoading(false);
            }
        };

        fetchCategories();
    }, []);

    const handleCategoryClick = (categoryId, categoryName) => {
        if (!categoryId || !categoryName) return;
        // ✅ Navegar usando ID de categoría
        navigate(`/productos?categoria=${categoryId}`);
    };

    // Mostrar máximo 6 categorías
    const shownCategories = categories.slice(0, 6);

    if (loading) {
        return (
            <div className="w-full flex justify-center mt-4">
                <div className="flex gap-4 overflow-x-scroll pb-2 scrollbar-hide min-h-[120px]">
                    {Array.from({ length: 6 }).map((_, i) => (
                        <div
                            key={i}
                            className="bg-secondary/20 border border-border rounded-xl animate-pulse flex-shrink-0"
                            style={{ width: 130, height: 120 }}
                        />
                    ))}
                </div>
            </div>
        );
    }

    if (error && categories.length === 0) {
        return (
            <div className="w-full flex justify-center mt-4">
                <div className="text-yellow-600">⚠️ {error}</div>
            </div>
        );
    }

    return (
        <div className="w-full mt-4">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 max-w-[900px] mx-auto justify-items-center">
                {shownCategories.map((cat) => (
                    <button
                        key={cat.id}
                        type="button"
                        onClick={() => handleCategoryClick(cat.id, cat.nombre)}
                        className="flex flex-col items-center justify-center bg-background rounded-xl shadow-sm hover:shadow-md transition px-6 py-4 cursor-pointer hover:bg-muted/20"
                        style={{ height: 120, width: 130 }}
                    >
                        <span className="text-3xl mb-2 text-foreground">
                            📦
                        </span>

                        <span className="text-xs font-medium text-foreground text-center line-clamp-2">
                            {cat.nombre || "Categoría"}
                        </span>
                    </button>
                ))}
            </div>
        </div>
    );
}

export default CategoryCards;
