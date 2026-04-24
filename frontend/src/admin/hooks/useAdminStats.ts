import { useEffect, useState } from "react";
import api from "../../services/api";
import type { AdminStats } from "../../types";

interface RawStats {
  totalVentas?: number;
  totalPedidos?: number;
  totalUsuarios?: number;
  totalProductos?: number;
}

export default function useAdminStats() {
  const [stats, setStats] = useState<Partial<AdminStats>>({});
  const [loading, setLoading] = useState(true);

  const fetchStats = async (): Promise<void> => {
    setLoading(true);
    try {
      const res = await api.get<RawStats>("/admin/stats");
      setStats({
        totalSales: res.data.totalVentas ?? 0,
        orders: res.data.totalPedidos ?? 0,
        users: res.data.totalUsuarios ?? 0,
        products: res.data.totalProductos ?? 0,
      });
    } catch (err: unknown) {
      const axiosErr = err as { response?: { status?: number; data?: unknown } };
      console.error("❌ Error cargando stats:", axiosErr.response?.status, axiosErr.response?.data);
      setStats({});
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return {
    stats,
    loading,
    refetch: fetchStats,
  };
}
