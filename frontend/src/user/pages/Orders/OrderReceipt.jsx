import { useParams, Link } from "react-router-dom";
import useMyOrders from "../../hooks/useMyOrders";
import ReceiptPreview from "../../components/ReceiptPreview";

export default function OrderReceipt() {
    const { orderId } = useParams();
    const { getOrderById, loading } = useMyOrders();

    if (loading) {
        return <p>Cargando boleta...</p>;
    }

    const order = getOrderById(orderId);

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
                    to={`/user/orders/${order.id}`}
                    className="text-sm text-blue-600 hover:underline"
                >
                    Volver al pedido
                </Link>
            </div>

            <ReceiptPreview order={order} />
        </div>
    );
}
