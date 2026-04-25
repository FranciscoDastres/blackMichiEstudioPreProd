import { useParams, Link } from "react-router-dom";
import useMyOrders from "../../hooks/useMyOrders";
import ReceiptPreview from "../../components/ReceiptPreview";

export default function OrderReceipt() {
    const { orderId } = useParams<{ orderId: string }>();
    const { orders, loading } = useMyOrders();

    if (loading) {
        return <p>Cargando boleta...</p>;
    }

    const order = orders.find((o) => String(o.id) === String(orderId));

    if (!order) {
        return <p>Pedido no encontrado.</p>;
    }

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">
                    Boleta pedido #{order.id}
                </h2>

                <Link
                    to={`/cuenta/pedidos/${order.id}`}
                    className="text-sm text-blue-600 hover:underline"
                >
                    Volver al pedido
                </Link>
            </div>

            <ReceiptPreview order={order as Parameters<typeof ReceiptPreview>[0]["order"]} />
        </div>
    );
}
