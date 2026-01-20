import { useEffect, useState } from "react";
import api from "../../services/api"; // AJUSTA si tu path es otro

const MOCK_ORDERS = [
    {
        id: 1,
        created_at: "2025-01-01",
        status: "pagado",
        total: 19990,
        items: [
            { id: 1, name: "Pack branding", price: 19990 },
        ],
    },
];

export default function useMyOrders() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            const response = await api.get("/my-orders");
            setOrders(response.data);
        } catch (error) {
            console.warn(
                "[useMyOrders] API no disponible, usando MOCK",
                error
            );
            setOrders(MOCK_ORDERS);
        } finally {
            setLoading(false);
        }
    };

    const getOrderById = (id) =>
        orders.find((o) => o.id === Number(id));

    return {
        orders,
        loading,
        getOrderById,
    };
}
