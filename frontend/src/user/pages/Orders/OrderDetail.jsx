import { Link } from "react-router-dom";
import useMyOrders from "../../hooks/useMyOrders";
import OrderCard from "../../components/OrderCard";

export default function OrdersPage() {
    const { orders, loading } = useMyOrders();

    if (loading) {
        return <p>Cargando pedidos...</p>;
    }

    return (
        <div className="space-y-4">
            <h2 className="text-2xl font-bold">Mis pedidos</h2>

            {orders.map((order) => (
                <OrderCard key={order.id} order={order}>
                    <div className="flex gap-4 text-sm">
                        <Link
                            to={`/user/orders/${order.id}`}
                            className="text-blue-600 hover:underline"
                        >
                            Ver detalle
                        </Link>

                        <Link
                            to={`/user/orders/${order.id}/receipt`}
                            className="text-gray-600 hover:underline"
                        >
                            Boleta
                        </Link>
                    </div>
                </OrderCard>
            ))}
        </div>
    );
}
