// hooks/useOrders.js
import { useEffect, useState, useCallback } from "react";
import axios from 'axios';
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

            const response = await axios.get(`${api.defaults.baseURL}/admin/pedidos`, {
                headers: { 'Authorization': `Bearer ${token}` },
                withCredentials: true
            });

            // 🔴 DIAGNÓSTICO: MUESTRA EL ESTADO TAL COMO VIENE DEL BACKEND
            console.log("🔍 Datos RAW del backend:", response.data);

            const rawData = Array.isArray(response.data) ? response.data : [];

            const formattedOrders = rawData.map(order => ({
                ...order,
                id: order.id,
                estado: String(order.estado || "pendiente").toLowerCase().trim(),
                total: !isNaN(parseFloat(order.total)) ? parseFloat(order.total) : 0,
                comprador_nombre: order.comprador_nombre || order.comprador_email || order.direccion_envio || "Cliente"
            }));

            setOrders(formattedOrders);
            console.log("✅ Pedidos formateados (post-normalización):", formattedOrders);
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
            const token = localStorage.getItem('token');
            const normalizedNewStatus = String(newStatus).toLowerCase().trim();

            setOrders(prev =>
                prev.map(o =>
                    o.id === orderId ? { ...o, estado: normalizedNewStatus } : o
                )
            );

            await axios.put(
                `http://localhost:3000/api/admin/pedidos/${orderId}/estado`,
                { estado: normalizedNewStatus },
                {
                    headers: { 'Authorization': `Bearer ${token}` },
                    withCredentials: true
                }
            );
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