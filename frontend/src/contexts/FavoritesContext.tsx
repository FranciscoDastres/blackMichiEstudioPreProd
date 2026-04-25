import { createContext, useCallback, useContext, useEffect, useMemo, useState, ReactNode } from "react";
import api from "../services/api";
import { useAuth } from "./AuthContext";

interface ToggleResult {
  requiresLogin?: boolean;
  isFavorite?: boolean;
}

interface FavoritesContextType {
  ids: number[];
  isFavorite: (productId: number | string) => boolean;
  toggle: (productId: number | string) => Promise<ToggleResult>;
  loading: boolean;
  ready: boolean;
}

export const FavoritesContext = createContext<FavoritesContextType | null>(null);

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [ids, setIds] = useState<number[]>([]);
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
        const res = await api.get<{ ids?: number[] }>("/client/favoritos/ids");
        if (!cancelled) setIds(Array.isArray(res.data?.ids) ? res.data.ids! : []);
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

  const isFavorite = useCallback(
    (productId: number | string): boolean => ids.includes(Number(productId)),
    [ids]
  );

  const toggle = useCallback(
    async (productId: number | string): Promise<ToggleResult> => {
      const pid = Number(productId);
      if (!user) {
        // Sin login: no hacemos nada; UI debería redirigir
        return { requiresLogin: true };
      }

      // Optimistic update
      const was = ids.includes(pid);
      setIds((prev) => (was ? prev.filter((id) => id !== pid) : [...prev, pid]));

      try {
        const res = await api.post<{ isFavorite?: boolean }>(`/client/favoritos/toggle/${pid}`);
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
    },
    [ids, user]
  );

  const value = useMemo<FavoritesContextType>(
    () => ({ ids, isFavorite, toggle, loading, ready }),
    [ids, isFavorite, toggle, loading, ready]
  );

  return <FavoritesContext.Provider value={value}>{children}</FavoritesContext.Provider>;
}

export const useFavorites = (): FavoritesContextType => {
  const ctx = useContext(FavoritesContext);
  if (!ctx) throw new Error("useFavorites debe usarse dentro de <FavoritesProvider>");
  return ctx;
};
