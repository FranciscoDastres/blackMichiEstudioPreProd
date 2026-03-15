// hooks/useOrders.js
import { useEffect, useState, useCallback } from "react";
import api from "../../services/api";

export default function useOrders() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchOrders = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            const token = localStorage.getItem('token');

            // ✅ MEJOR: Usar api en lugar de axios.get directamente
            const response = await api.get('/admin/pedidos', {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            // 🔴 DIAGNÓSTICO: MUESTRA EL ESTADO TAL COMO VIENE DEL BACKEND
            console.log("🔍 Datos RAW del backend:", response.data);

            const rawData = Array.isArray(response.data) ? response.data : [];

            const formattedOrders = rawData.map(order => ({
                ...order,
                id: order.id,
                estado: String(order.estado || "pendiente").toLowerCase().trim(),
                total: !isNaN(parseFloat(order.total)) ? parseFloat(order.total) : 0,
                comprador_nombre: order.usuario_nombre || order.usuario_email || "Cliente"
            }));

            setOrders(formattedOrders);
            console.log("✅ Pedidos formateados (post-normalización):", formattedOrders);
        } catch (err) {
            console.error("[useOrders] Error:", err.response?.status, err.response?.data, err.message);
            setError(err.response?.data?.message || "Error al cargar pedidos");
            setOrders([]);
        } finally {
            setLoading(false);
        }
    }, []);

    const updateOrderStatus = async (orderId, newStatus) => {
        try {
            const token = localStorage.getItem('token');
            const normalizedNewStatus = String(newStatus).toLowerCase().trim();

            // Optimistic update
            setOrders(prev =>
                prev.map(o =>
                    o.id === orderId ? { ...o, estado: normalizedNewStatus } : o
                )
            );

            // ✅ CORREGIDO: Usar api en lugar de localhost:3000
            await api.put(
                `/admin/pedidos/${orderId}/estado`,
                { estado: normalizedNewStatus },
                {
                    headers: { 'Authorization': `Bearer ${token}` }
                }
            );

            return true;
        } catch (err) {
            console.error("Error al actualizar:", err);
            // Revertir el cambio si hay error
            fetchOrders();
            return false;
        }
    };

    useEffect(() => {
        fetchOrders();
    }, [fetchOrders]);

    return { orders, loading, error, fetchOrders, updateOrderStatus };
}