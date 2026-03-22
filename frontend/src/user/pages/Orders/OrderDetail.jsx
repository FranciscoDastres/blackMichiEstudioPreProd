// src/user/pages/Orders/OrderDetail.jsx
import { useParams, Link } from 'react-router-dom';
import useMyOrders from '../../hooks/useMyOrders';

export default function OrderDetail() {
    const { id } = useParams();
    const { orders, loading } = useMyOrders();

    if (loading) return <p className="p-4">Cargando pedido...</p>;

    const order = orders.find(o => String(o.id) === String(id));

    if (!order) return (
        <div className="bg-white rounded-2xl shadow-sm p-8 text-center">
            <p className="text-gray-500">Pedido no encontrado.</p>
            <Link to="/cuenta/pedidos" className="text-black underline text-sm mt-2 block">
                Volver a mis pedidos
            </Link>
        </div>
    );

    return (
        <div className="bg-white rounded-2xl shadow-sm p-8 space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-xl font-bold text-gray-900">Pedido #{order.id}</h1>
                <Link to="/cuenta/pedidos" className="text-sm text-gray-500 hover:underline">
                    ← Volver
                </Link>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                <div>
                    <p className="font-medium text-gray-800">Fecha</p>
                    <p>{new Date(order.created_at).toLocaleDateString('es-CL')}</p>
                </div>
                <div>
                    <p className="font-medium text-gray-800">Estado</p>
                    <p className="capitalize">{order.estado || order.status}</p>
                </div>
                <div>
                    <p className="font-medium text-gray-800">Total</p>
                    <p className="font-bold text-gray-900">${order.total?.toLocaleString('es-CL')}</p>
                </div>
            </div>
        </div>
    );
}