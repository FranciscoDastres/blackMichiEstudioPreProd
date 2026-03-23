export default function ReceiptPreview({ order }) {
    const CLP = new Intl.NumberFormat("es-CL", {
        style: "currency",
        currency: "CLP",
        maximumFractionDigits: 0,
    });

    const getEstadoBadge = (estado) => {
        const map = {
            pagado: "bg-green-500/20 text-green-400 border border-green-500/30",
            pendiente: "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30",
            rechazado: "bg-red-500/20 text-red-400 border border-red-500/30",
            cancelado: "bg-gray-500/20 text-gray-400 border border-gray-500/30",
        };
        return map[estado] || map.pendiente;
    };

    const subtotal = order.total - (order.costo_envio || order.costoEnvio || 0);
    const costoEnvio = order.costo_envio || order.costoEnvio || 0;

    return (
        <div className="glass-panel rounded-2xl border border-border p-6 space-y-6">
            {/* Header */}
            <div className="flex items-start justify-between pb-4 border-b border-border">
                <div>
                    <h3 className="text-xl font-display font-extrabold text-foreground">
                        Black Michi Estudio
                    </h3>
                    <p className="text-sm text-muted mt-1">Boleta electrónica</p>
                </div>
                <div className="text-right">
                    <p className="text-xs text-muted">Pedido</p>
                    <p className="font-mono font-bold text-primary text-lg">#{order.id}</p>
                </div>
            </div>

            {/* Info del pedido */}
            <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="glass-panel rounded-xl p-3 border border-border">
                    <p className="text-muted text-xs mb-1">Fecha</p>
                    <p className="text-foreground font-medium">
                        {new Date(order.created_at || order.fechaCreacion).toLocaleDateString("es-CL", {
                            year: "numeric", month: "long", day: "numeric"
                        })}
                    </p>
                </div>
                <div className="glass-panel rounded-xl p-3 border border-border">
                    <p className="text-muted text-xs mb-1">Estado</p>
                    <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium capitalize ${getEstadoBadge(order.status || order.estado)}`}>
                        {order.status || order.estado}
                    </span>
                </div>
                {(order.comprador?.nombre || order.comprador_nombre) && (
                    <div className="glass-panel rounded-xl p-3 border border-border col-span-2">
                        <p className="text-muted text-xs mb-1">Cliente</p>
                        <p className="text-foreground font-medium">
                            {order.comprador?.nombre || order.comprador_nombre}
                        </p>
                        <p className="text-muted text-xs">
                            {order.comprador?.email || order.comprador_email}
                        </p>
                    </div>
                )}
            </div>

            {/* Detalle de productos */}
            <div>
                <h4 className="text-sm font-display font-bold text-foreground mb-3">
                    Detalle de productos
                </h4>
                <div className="space-y-2">
                    {(order.items || []).map((item, index) => (
                        <div
                            key={item.id || index}
                            className="flex justify-between items-center py-2 border-b border-border last:border-0"
                        >
                            <div className="flex-1 min-w-0 pr-4">
                                <p className="text-sm text-foreground font-medium truncate">
                                    {item.name || item.titulo || item.producto_titulo}
                                </p>
                                {item.cantidad && (
                                    <p className="text-xs text-muted">
                                        Cantidad: {item.cantidad}
                                    </p>
                                )}
                            </div>
                            <p className="text-sm font-bold text-primary whitespace-nowrap">
                                {CLP.format(item.price || item.subtotal || item.precio_unitario)}
                            </p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Totales */}
            <div className="glass-panel rounded-xl p-4 border border-border space-y-2">
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
    );
}
