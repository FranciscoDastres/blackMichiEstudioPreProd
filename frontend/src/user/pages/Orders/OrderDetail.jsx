import { useParams, Link } from 'react-router-dom';
import { useMyOrders } from '../../hooks/useMyOrders';
import { ArrowLeft, Package, MapPin, FileText, CreditCard, Truck } from 'lucide-react';

const statusConfig = {
    pendiente: { label: 'Pendiente', cls: 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' },
    pagado: { label: 'Pagado', cls: 'bg-green-500/20 text-green-400 border border-green-500/30' },
    confirmado: { label: 'Confirmado', cls: 'bg-blue-500/20 text-blue-400 border border-blue-500/30' },
    en_proceso: { label: 'En proceso', cls: 'bg-orange-500/20 text-orange-400 border border-orange-500/30' },
    enviado: { label: 'Enviado', cls: 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30' },
    entregado: { label: 'Entregado', cls: 'bg-green-500/20 text-green-400 border border-green-500/30' },
    cancelado: { label: 'Cancelado', cls: 'bg-red-500/20 text-red-400 border border-red-500/30' },
};

const CLP = new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    maximumFractionDigits: 0,
});

export default function OrderDetail() {
    const { id } = useParams();
    const { orders, loading } = useMyOrders();

    if (loading) return (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
            <div className="animate-spin rounded-full h-10 w-10 border-2 border-primary border-t-transparent" />
            <p className="text-muted text-sm">Cargando pedido...</p>
        </div>
    );

    const order = orders.find(o => String(o.id) === String(id));

    if (!order) return (
        <div className="glass-panel rounded-2xl border border-border p-12 text-center">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Package className="w-8 h-8 text-primary/50" />
            </div>
            <p className="text-foreground font-medium mb-1">Pedido no encontrado</p>
            <p className="text-muted text-sm mb-6">El pedido que buscas no existe o no tienes acceso.</p>
            <Link
                to="/cuenta/pedidos"
                className="inline-block text-xs px-4 py-2 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors font-medium"
            >
                ← Volver a mis pedidos
            </Link>
        </div>
    );

    const estado = order.estado || order.status;
    const status = statusConfig[estado] || {
        label: estado || '—',
        cls: 'bg-gray-500/20 text-gray-400 border border-gray-500/30'
    };
    const subtotal = order.total - (order.costo_envio || order.costoEnvio || 0);
    const costoEnvio = order.costo_envio || order.costoEnvio || 0;

    return (
        <div className="space-y-5">
            {/* Header */}
            <div className="glass-panel rounded-2xl border border-border p-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                            <CreditCard className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                            <h1 className="text-xl font-display font-extrabold text-foreground">
                                Pedido #{order.id}
                            </h1>
                            <p className="text-muted text-sm mt-0.5">
                                {new Date(order.created_at).toLocaleDateString('es-CL', {
                                    year: 'numeric', month: 'long', day: 'numeric'
                                })}
                            </p>
                        </div>
                    </div>
                    <Link
                        to="/cuenta/pedidos"
                        className="flex items-center gap-1.5 text-xs px-3 py-2 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors font-medium"
                    >
                        <ArrowLeft className="w-3.5 h-3.5" />
                        Volver
                    </Link>
                </div>
            </div>

            {/* Info general */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div className="glass-panel rounded-xl border border-border p-4">
                    <p className="text-xs text-muted mb-1">Estado</p>
                    <span className={`inline-block text-xs px-2.5 py-0.5 rounded-full font-medium ${status.cls}`}>
                        {status.label}
                    </span>
                </div>
                <div className="glass-panel rounded-xl border border-border p-4">
                    <p className="text-xs text-muted mb-1">Total</p>
                    <p className="price-text font-display font-extrabold text-lg">
                        {CLP.format(order.total)}
                    </p>
                </div>
                {order.metodo_pago && (
                    <div className="glass-panel rounded-xl border border-border p-4 col-span-2 sm:col-span-1">
                        <p className="text-xs text-muted mb-1">Método de pago</p>
                        <p className="text-foreground font-medium text-sm capitalize">
                            {order.metodo_pago}
                        </p>
                    </div>
                )}
            </div>

            {/* Productos */}
            {order.items && order.items.length > 0 && (
                <div className="glass-panel rounded-2xl border border-border p-6">
                    <div className="flex items-center gap-2 mb-4">
                        <Package className="w-4 h-4 text-primary" />
                        <h2 className="text-sm font-display font-bold text-foreground">
                            Productos ({order.items.length})
                        </h2>
                    </div>
                    <div className="space-y-3">
                        {order.items.map((item, index) => (
                            <div
                                key={item.id || index}
                                className="flex items-center gap-4 py-3 border-b border-border last:border-0"
                            >
                                {(item.producto_imagen || item.imagen) && (
                                    <img
                                        src={item.producto_imagen || item.imagen}
                                        alt={item.titulo || item.producto_titulo}
                                        className="w-14 h-14 object-cover rounded-xl flex-shrink-0"
                                        onError={e => { e.target.style.display = 'none'; }}
                                    />
                                )}
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-foreground truncate">
                                        {item.titulo || item.producto_titulo || item.name}
                                    </p>
                                    <p className="text-xs text-muted mt-0.5">
                                        Cantidad: {item.cantidad || item.quantity}
                                    </p>
                                </div>
                                <p className="text-sm font-bold text-primary flex-shrink-0">
                                    {CLP.format(item.subtotal || item.precio_unitario * (item.cantidad || 1))}
                                </p>
                            </div>
                        ))}
                    </div>

                    {/* Totales */}
                    <div className="mt-4 pt-4 border-t border-border space-y-2">
                        <div className="flex justify-between text-sm text-muted">
                            <span>Subtotal</span>
                            <span>{CLP.format(subtotal)}</span>
                        </div>
                        <div className="flex justify-between text-sm text-muted">
                            <span>Envío</span>
                            <span>{CLP.format(costoEnvio)}</span>
                        </div>
                        <div className="flex justify-between text-base font-display font-extrabold text-foreground pt-2 border-t border-border">
                            <span>Total</span>
                            <span className="price-text">{CLP.format(order.total)}</span>
                        </div>
                    </div>
                </div>
            )}

            {/* Número de seguimiento */}
            {order.numero_seguimiento && (
                <div className="glass-panel rounded-xl border border-indigo-500/30 bg-indigo-500/5 p-4">
                    <div className="flex items-center gap-2 mb-2">
                        <Truck className="w-4 h-4 text-indigo-400" />
                        <p className="text-xs font-bold text-foreground">Número de seguimiento</p>
                    </div>
                    <p className="text-sm font-mono font-semibold text-indigo-400">{order.numero_seguimiento}</p>
                    {order.fecha_envio && (
                        <p className="text-xs text-muted mt-1">
                            Enviado el {new Date(order.fecha_envio).toLocaleDateString('es-CL', {
                                year: 'numeric', month: 'long', day: 'numeric'
                            })}
                        </p>
                    )}
                </div>
            )}

            {/* Dirección y notas */}
            <div className="grid sm:grid-cols-2 gap-3">
                {(order.direccion_envio || order.direccionEnvio) && (
                    <div className="glass-panel rounded-xl border border-border p-4">
                        <div className="flex items-center gap-2 mb-2">
                            <MapPin className="w-4 h-4 text-primary" />
                            <p className="text-xs font-bold text-foreground">Dirección de envío</p>
                        </div>
                        <p className="text-sm text-muted">
                            {order.direccion_envio || order.direccionEnvio}
                        </p>
                    </div>
                )}
                {(order.notas) && (
                    <div className="glass-panel rounded-xl border border-border p-4">
                        <div className="flex items-center gap-2 mb-2">
                            <FileText className="w-4 h-4 text-primary" />
                            <p className="text-xs font-bold text-foreground">Notas</p>
                        </div>
                        <p className="text-sm text-muted">{order.notas}</p>
                    </div>
                )}
            </div>
        </div>
    );
}
