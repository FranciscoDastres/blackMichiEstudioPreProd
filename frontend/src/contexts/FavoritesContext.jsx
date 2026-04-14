import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import api from "../services/api";
import { useAuth } from "./AuthContext";

export const FavoritesContext = createContext(null);

export function FavoritesProvider({ children }) {
    const { user } = useAuth();
    const [ids, setIds] = useState([]);
    const [loading, setLoading] = useState(false);
    const [ready, setReady] = useState(false);

    // Cargar ids al iniciar sesión; limpiar al cerrar
    useEffect(() => {
        let cancelled = false;
        const run = async () => {
            if (!user) {
                setIds([]);
                setReady(true);
                return;
            }
            try {
                setLoading(true);
                const res = await api.get("/client/favoritos/ids");
                if (!cancelled) setIds(Array.isArray(res.data?.ids) ? res.data.ids : []);
            } catch {
                if (!cancelled) setIds([]);
            } finally {
                if (!cancelled) {
                    setLoading(false);
                    setReady(true);
                }
            }
        };
        run();
        return () => {
            cancelled = true;
        };
    }, [user]);

    const isFavorite = useCallback((productId) => ids.includes(Number(productId)), [ids]);

    const toggle = useCallback(async (productId) => {
        const pid = Number(productId);
        if (!user) {
            // Sin login: no hacemos nada; UI debería redirigir
            return { requiresLogin: true };
        }

        // Optimistic update
        const was = ids.includes(pid);
        setIds((prev) => (was ? prev.filter((id) => id !== pid) : [...prev, pid]));

        try {
            const res = await api.post(`/client/favoritos/toggle/${pid}`);
            // Revalidar con respuesta servidor
            if (res.data?.isFavorite === false && ids.includes(pid)) {
                setIds((prev) => prev.filter((id) => id !== pid));
            }
            if (res.data?.isFavorite === true && !ids.includes(pid)) {
                setIds((prev) => (prev.includes(pid) ? prev : [...prev, pid]));
            }
            return { isFavorite: res.data?.isFavorite };
        } catch (err) {
            // Revertir
            setIds((prev) => (was ? [...prev, pid] : prev.filter((id) => id !== pid)));
            throw err;
        }
    }, [ids, user]);

    const value = useMemo(
        () => ({ ids, isFavorite, toggle, loading, ready }),
        [ids, isFavorite, toggle, loading, ready]
    );

    return <FavoritesContext.Provider value={value}>{children}</FavoritesContext.Provider>;
}

export const useFavorites = () => {
    const ctx = useContext(FavoritesContext);
    if (!ctx) throw new Error("useFavorites debe usarse dentro de <FavoritesProvider>");
    return ctx;
};
