import { Link } from "react-router-dom";

export default function OrderCard({ order }) {
    return (
        <div className="bg-white border rounded-lg p-4 flex justify-between items-center">
            <div className="space-y-1">
                <p className="text-sm text-gray-500">
                    Pedido #{order.id}
                </p>

                <p className="text-sm">
                    Fecha:{" "}
                    <span className="text-gray-600">
                        {new Date(order.created_at).toLocaleDateString()}
                    </span>
                </p>

                <p className="text-sm">
                    Estado:{" "}
                    <span className="font-medium capitalize">
                        {order.status}
                    </span>
                </p>
            </div>

            <div className="text-right space-y-2">
                <p className="font-semibold">
                    ${order.total}
                </p>

                <Link
                    to={`/user/orders/${order.id}`}
                    className="inline-block text-sm text-blue-600 hover:underline"
                >
                    Ver detalle
                </Link>
            </div>
        </div>
    );
}
