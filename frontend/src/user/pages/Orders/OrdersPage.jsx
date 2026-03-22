// src/user/pages/Orders/OrdersPage.jsx
import { useMyOrders } from '../../hooks/useMyOrders';
import OrderCard from './OrderCard';

export default function OrdersPage() {
    const { orders, loading } = useMyOrders();

    if (loading) return (
        <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black" />
        </div>
    );

    return (
        <div className="bg-white rounded-2xl shadow-sm p-8">
            <h1 className="text-xl font-bold text-gray-900 mb-6">Mis Pedidos</h1>
            {orders.length === 0 ? (
                <div className="text-center py-16 text-gray-400">
                    <p className="text-lg">Aún no tienes pedidos</p>
                    <a href="/products" className="text-black underline text-sm mt-2 block">
                        Ver productos
                    </a>
                </div>
            ) : (
                <div className="space-y-4">
                    {orders.map((order) => (
                        <OrderCard key={order.id} order={order} />
                    ))}
                </div>
            )}
        </div>
    );
}
