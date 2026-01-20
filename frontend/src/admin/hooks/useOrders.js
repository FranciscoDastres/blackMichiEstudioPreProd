import { useEffect, useState, useCallback } from "react";
import api from '../../api/axios';

export default function useOrders() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchOrders = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            // Usamos 'api' que ya tiene la URL de Render y el Token configurados
            const response = await api.get('/admin/pedidos');

            console.log("🔍 Datos RAW del backend:", response.data);
            const rawData = Array.isArray(response.data) ? response.data : [];

            const formattedOrders = rawData.map(order => ({
                ...order,
                id: order.id,
                estado: String(order.estado || "pendiente").toLowerCase().trim(),
                total: !isNaN(parseFloat(order.total)) ? parseFloat(order.total) : 0,
                comprador_nombre: order.comprador_nombre || order.comprador_email || "Cliente"
            }));

            setOrders(formattedOrders);
        } catch (err) {
            console.error("[useOrders] Error:", err);
            setError(err.response?.data?.message || "Error al cargar pedidos");
            setOrders([]);
        } finally {
            setLoading(false);
        }
    }, []);

    const updateOrderStatus = async (orderId, newStatus) => {
        try {
            const normalizedNewStatus = String(newStatus).toLowerCase().trim();

            // Actualización visual rápida
            setOrders(prev =>
                prev.map(o =>
                    o.id === orderId ? { ...o, estado: normalizedNewStatus } : o
                )
            );

            // Petición al backend usando tu instancia 'api'
            await api.put(`/admin/pedidos/${orderId}/estado`, {
                estado: normalizedNewStatus
            });

            return true;
        } catch (err) {
            console.error("Error al actualizar:", err);
            fetchOrders();
            return false;
        }
    };

    useEffect(() => {
        fetchOrders();
    }, [fetchOrders]);

    return { orders, loading, error, fetchOrders, updateOrderStatus };
}