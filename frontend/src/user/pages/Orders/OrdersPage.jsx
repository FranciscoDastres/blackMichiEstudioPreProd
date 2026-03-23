import { useMyOrders } from '../../hooks/useMyOrders';
import OrderCard from './OrderCard';
import { ShoppingBag, Package } from 'lucide-react';

export default function OrdersPage() {
    const { orders, loading } = useMyOrders();

    if (loading) return (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
            <div className="animate-spin rounded-full h-10 w-10 border-2 border-primary border-t-transparent" />
            <p className="text-muted text-sm">Cargando pedidos...</p>
        </div>
    );

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="glass-panel rounded-2xl border border-border p-6">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                        <ShoppingBag className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-display font-extrabold text-foreground">
                            Mis Pedidos
                        </h1>
                        <p className="text-muted text-sm mt-0.5">
                            {orders.length > 0
                                ? `${orders.length} pedido${orders.length > 1 ? 's' : ''} en total`
                                : 'Historial de compras'}
                        </p>
                    </div>
                </div>

                {/* Stats rápidas */}
                {orders.length > 0 && (
                    <div className="grid grid-cols-3 gap-3 mt-6">
                        <div className="glass-panel rounded-xl p-3 border border-border text-center">
                            <p className="text-2xl font-display font-extrabold text-foreground">
                                {orders.length}
                            </p>
                            <p className="text-xs text-muted mt-0.5">Total</p>
                        </div>
                        <div className="glass-panel rounded-xl p-3 border border-border text-center">
                            <p className="text-2xl font-display font-extrabold text-green-400">
                                {orders.filter(o => (o.status || o.estado) === 'pagado').length}
                            </p>
                            <p className="text-xs text-muted mt-0.5">Pagados</p>
                        </div>
                        <div className="glass-panel rounded-xl p-3 border border-border text-center">
                            <p className="text-2xl font-display font-extrabold text-yellow-400">
                                {orders.filter(o => (o.status || o.estado) === 'pendiente').length}
                            </p>
                            <p className="text-xs text-muted mt-0.5">Pendientes</p>
                        </div>
                    </div>
                )}
            </div>

            {/* Lista de pedidos o estado vacío */}
            {orders.length === 0 ? (
                <div className="glass-panel rounded-2xl border border-border p-16 text-center">
                    <div className="w-20 h-20 mx-auto mb-4 bg-primary/10 rounded-full flex items-center justify-center">
                        <Package className="w-10 h-10 text-primary/50" />
                    </div>
                    <h2 className="text-xl font-display font-bold text-foreground mb-2">
                        Aún no tienes pedidos
                    </h2>
                    <p className="text-muted text-sm mb-6">
                        Cuando realices una compra aparecerá aquí
                    </p>
                    <a
                        href="/productos"
                        className="btn-add-cart inline-block !px-6 !py-3 !rounded-xl"
                    >
                        Ver productos
                    </a>
                </div>
            ) : (
                <div className="space-y-3">
                    {orders.map((order) => (
                        <OrderCard key={order.id} order={order} />
                    ))}
                </div>
            )}
        </div>
    );
}
