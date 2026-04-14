import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Heart, Trash2, ShoppingBag, PackageX } from "lucide-react";
import { toast } from "sonner";
import api from "../../../services/api";
import { getImageUrl } from "../../../utils/getImageUrl";
import useCart from "../../../hooks/useCart";
import { useFavorites } from "../../../contexts/FavoritesContext";

const CLP = new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    maximumFractionDigits: 0,
});

export default function FavoritesPage() {
    const [favoritos, setFavoritos] = useState([]);
    const [loading, setLoading] = useState(true);
    const { toggle } = useFavorites();
    const { addToCart } = useCart();

    useEffect(() => {
        const load = async () => {
            try {
                const res = await api.get("/client/favoritos");
                setFavoritos(Array.isArray(res.data) ? res.data : []);
            } catch {
                toast.error("No se pudieron cargar los favoritos");
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    const handleRemove = async (id) => {
        try {
            await toggle(id);
            setFavoritos((prev) => prev.filter((p) => p.id !== id));
            toast.success("Quitado de favoritos");
        } catch {
            toast.error("No se pudo quitar");
        }
    };

    const handleAddToCart = (product) => {
        const outOfStock = Number(product.stock ?? 0) <= 0;
        if (outOfStock) {
            toast.error("Sin stock disponible");
            return;
        }
        addToCart(product);
        toast.success("Agregado al carrito");
    };

    if (loading) {
        return (
            <div className="glass-panel border border-border rounded-2xl p-8">
                <div className="animate-pulse space-y-4">
                    <div className="h-6 w-48 bg-muted/30 rounded" />
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="h-20 bg-muted/20 rounded-xl" />
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-rose-500/10 border border-rose-500/20 flex items-center justify-center">
                    <Heart className="w-5 h-5 text-rose-500" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-foreground">Mis Favoritos</h1>
                    <p className="text-sm text-muted">{favoritos.length} producto{favoritos.length !== 1 ? "s" : ""}</p>
                </div>
            </div>

            {favoritos.length === 0 ? (
                <div className="glass-panel border border-border rounded-2xl p-12 text-center">
                    <PackageX className="w-12 h-12 text-muted mx-auto mb-4" />
                    <p className="text-muted mb-4">Aún no tienes productos favoritos</p>
                    <Link
                        to="/productos"
                        className="inline-block px-5 py-2.5 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors"
                    >
                        Ver productos
                    </Link>
                </div>
            ) : (
                <div className="grid sm:grid-cols-2 gap-4">
                    {favoritos.map((p) => {
                        const outOfStock = Number(p.stock ?? 0) <= 0;
                        return (
                            <div
                                key={p.id}
                                className="glass-panel border border-border rounded-2xl p-4 flex gap-3"
                            >
                                <Link to={`/producto/${p.id}`} className="shrink-0">
                                    <img
                                        src={getImageUrl(p.imagen_principal)}
                                        alt={p.titulo}
                                        className="w-24 h-24 object-cover rounded-lg bg-secondary/30"
                                        onError={(e) => { e.target.src = "/placeholder.svg"; }}
                                    />
                                </Link>
                                <div className="flex-1 min-w-0">
                                    <Link to={`/producto/${p.id}`} className="block">
                                        <h3 className="font-semibold text-foreground text-sm line-clamp-2 mb-1 hover:text-primary transition-colors">
                                            {p.titulo}
                                        </h3>
                                    </Link>
                                    <p className="text-primary font-bold text-sm mb-2">{CLP.format(p.precio)}</p>
                                    <div className="flex items-center gap-1">
                                        <button
                                            onClick={() => handleAddToCart(p)}
                                            disabled={outOfStock}
                                            className="flex-1 flex items-center justify-center gap-1 text-xs px-2 py-1.5 rounded-md bg-primary/10 text-primary hover:bg-primary/20 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                                        >
                                            <ShoppingBag className="w-3.5 h-3.5" />
                                            {outOfStock ? "Sin stock" : "Agregar"}
                                        </button>
                                        <button
                                            onClick={() => handleRemove(p.id)}
                                            aria-label="Quitar de favoritos"
                                            className="px-2 py-1.5 rounded-md bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 transition-colors"
                                        >
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
