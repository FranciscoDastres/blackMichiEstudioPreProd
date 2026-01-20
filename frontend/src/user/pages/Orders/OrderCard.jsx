export default function OrderCard({ order, children }) {
    return (
        <div className="border rounded p-4 bg-white space-y-2">
            <div className="flex justify-between items-center">
                <div>
                    <p className="text-sm text-gray-500">
                        Pedido #{order.id}
                    </p>
                    <p className="text-sm text-gray-600">
                        Fecha: {order.created_at}
                    </p>
                </div>

                <span className="text-xs px-2 py-1 rounded bg-gray-200">
                    {order.status}
                </span>
            </div>

            <div className="flex justify-between items-center">
                <p className="font-semibold">
                    Total: ${order.total}
                </p>

                {children}
            </div>
        </div>
    );
}
