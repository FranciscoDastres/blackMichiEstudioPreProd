// src/user/pages/Orders/OrderCard.jsx
import { Link } from 'react-router-dom';

const statusColors = {
    pendiente: 'bg-yellow-100 text-yellow-700',
    pagado: 'bg-green-100 text-green-700',
    enviado: 'bg-blue-100 text-blue-700',
    cancelado: 'bg-red-100 text-red-700',
};

export default function OrderCard({ order }) {
    return (
        <div className="border border-gray-100 rounded-xl p-5 flex items-center
      justify-between hover:shadow-sm transition-shadow">
            <div>
                <p className="font-semibold text-gray-800">Pedido #{order.id}</p>
                <p className="text-xs text-gray-400 mt-0.5">
                    {new Date(order.created_at).toLocaleDateString('es-CL')}
                </p>
                <span className={`inline-block mt-2 text-xs px-2 py-0.5 rounded-full font-medium
          ${statusColors[order.status] || 'bg-gray-100 text-gray-500'}`}>
                    {order.status}
                </span>
            </div>
            <div className="text-right">
                <p className="font-bold text-gray-900">
                    ${order.total?.toLocaleString('es-CL')}
                </p>
                <Link
                    to={`/cuenta/pedidos/${order.id}`}
                    className="text-xs text-black underline mt-1 block"
                >
                    Ver detalle →
                </Link>
            </div>
        </div>
    );
}
