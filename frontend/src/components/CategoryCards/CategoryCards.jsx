// CategoryCards.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ApiService from "../../services/api";

function CategoryCards() {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const navigate = useNavigate();

    useEffect(() => {
        ApiService.getCategorias()
            .then((res) => setCategories(Array.isArray(res) ? res : []))
            .catch((err) => {
                setError("Error al cargar categorías");
                console.error(err);
            })
            .finally(() => setLoading(false));
    }, []);

    const handleCategoryClick = (categoryName) => {
        if (!categoryName) return;
        navigate(`/productos?categoria=${encodeURIComponent(categoryName)}`);
    };

    // Si necesitas 6 tarjetas mínimo, puedes completar con placeholders
    // Pero por ahora, mostramos solo las reales
    const shownCategories = categories.slice(0, 6);

    if (loading) {
        return (
            <div className="w-full flex justify-center mt-4">
                <div className="text-muted">Cargando categorías...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="w-full flex justify-center mt-4">
                <div className="text-red-500">{error}</div>
            </div>
        );
    }

    return (
        <div className="w-full flex justify-center mt-4">
            <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
                {shownCategories.map((cat) => (
                    <button
                        key={cat.id}
                        type="button"
                        onClick={() => handleCategoryClick(cat.nombre)}
                        disabled={cat.disabled}
                        className={`flex flex-col items-center justify-center bg-background rounded-xl shadow-sm hover:shadow-md transition px-6 py-4 flex-shrink-0 ${cat.disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
                        style={{ width: 130, height: 120 }}
                        aria-label={`Ver productos en ${cat.nombre}`}
                    >
                        <span className={`text-3xl mb-2 ${cat.color_icono || "text-foreground"}`}>
                            {cat.icono || "📦"}
                        </span>
                        <span className="text-xs font-medium text-foreground text-center line-clamp-2">
                            {cat.nombre}
                        </span>
                    </button>
                ))}
            </div>
        </div>
    );
}

export default CategoryCards;