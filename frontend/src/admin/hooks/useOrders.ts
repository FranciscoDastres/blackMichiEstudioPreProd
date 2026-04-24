import { useEffect, useState, useCallback } from "react";
import api from "../../services/api";
import type { Order } from "../../types";

interface RawOrder {
  id: number;
  estado?: string;
  total?: string | number;
  usuario_nombre?: string;
  usuario_email?: string;
  [key: string]: unknown;
}

export default function useOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOrders = useCallback(async (): Promise<void> => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem('token');
      const response = await api.get<RawOrder[]>('/admin/pedidos', {
        headers: { 'Authorization': `Bearer ${token}` },
      });

      const rawData = Array.isArray(response.data) ? response.data : [];

      const formattedOrders: Order[] = rawData.map(order => ({
        ...order,
        id: order.id,
        estado: String(order.estado ?? "pendiente").toLowerCase().trim(),
        total: !isNaN(parseFloat(String(order.total))) ? parseFloat(String(order.total)) : 0,
        comprador_nombre: order.usuario_nombre || order.usuario_email || "Cliente",
      }));

      setOrders(formattedOrders);
    } catch (err: unknown) {
      const axiosErr = err as { response?: { status?: number; data?: { message?: string } }; message?: string };
      console.error("[useOrders] Error:", axiosErr.response?.status, axiosErr.response?.data, axiosErr.message);
      setError(axiosErr.response?.data?.message ?? "Error al cargar pedidos");
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const updateOrderStatus = async (orderId: number, newStatus: string): Promise<boolean> => {
    try {
      const token = localStorage.getItem('token');
      const normalizedNewStatus = String(newStatus).toLowerCase().trim();

      // Optimistic update
      setOrders(prev =>
        prev.map(o =>
          o.id === orderId ? { ...o, estado: normalizedNewStatus } : o
        )
      );

      await api.put(
        `/admin/pedidos/${orderId}/estado`,
        { estado: normalizedNewStatus },
        { headers: { 'Authorization': `Bearer ${token}` } }
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
