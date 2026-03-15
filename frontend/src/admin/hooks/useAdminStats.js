import { useEffect, useState } from "react";
import api from "../../services/api";

export default function useAdminStats() {
    const [stats, setStats] = useState({});
    const [loading, setLoading] = useState(true);

    const fetchStats = async () => {
        setLoading(true);
        try {
            const res = await api.get("/admin/stats");
            console.log('✅ Stats cargados:', res.data);
            setStats({
                totalSales: res.data.totalVentas || 0,
                orders: res.data.totalPedidos || 0,
                users: res.data.totalUsuarios || 0,
                products: res.data.totalProductos || 0,
            });
        } catch (err) {
            console.error("❌ Error cargando stats:", err.response?.status, err.response?.data);
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
        refetch: fetchStats
    };
}