export default function ReceiptPreview({ order }) {
    return (
        <div className="border rounded p-6 bg-white space-y-4 text-sm">
            <div>
                <h3 className="font-semibold text-lg">
                    Black Michi Studio
                </h3>
                <p>Boleta electrónica</p>
            </div>

            <div className="space-y-1">
                <p><strong>Pedido:</strong> #{order.id}</p>
                <p><strong>Fecha:</strong> {order.created_at}</p>
                <p><strong>Estado:</strong> {order.status}</p>
            </div>

            <div>
                <h4 className="font-semibold mb-2">Detalle</h4>
                <ul className="space-y-1">
                    {order.items.map((item) => (
                        <li
                            key={item.id}
                            className="flex justify-between"
                        >
                            <span>{item.name}</span>
                            <span>${item.price}</span>
                        </li>
                    ))}
                </ul>
            </div>

            <div className="border-t pt-2 flex justify-between font-semibold">
                <span>Total</span>
                <span>${order.total}</span>
            </div>
        </div>
    );
}
