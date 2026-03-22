// src/user/pages/Orders/OrdersPage.jsx
import { useMyOrders } from '../../hooks/useMyOrders';
import OrderCard from './OrderCard';
import { ShoppingBag } from 'lucide-react';

export default function OrdersPage() {
    const { orders, loading } = useMyOrders();

    if (loading) return (
        <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-sky-500" />
        </div>
    );

    return (
        <div className="bg-gray-900/80 border border-gray-800 rounded-2xl shadow-xl p-8">
            <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-full bg-sky-500/10 flex items-center justify-center">
                    <ShoppingBag className="w-5 h-5 text-sky-400" />
                </div>
                <h1 className="text-xl font-bold text-white">Mis Pedidos</h1>
            </div>

            {orders.length === 0 ? (
                <div className="text-center py-16">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-800 flex items-center justify-center">
                        <ShoppingBag className="w-8 h-8 text-gray-600" />
                    </div>
                    <p className="text-gray-400 text-lg">Aún no tienes pedidos</p>
                    <a href="/productos" className="text-sky-400 hover:text-sky-300 text-sm mt-2 block transition-colors">
                        Ver productos →
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