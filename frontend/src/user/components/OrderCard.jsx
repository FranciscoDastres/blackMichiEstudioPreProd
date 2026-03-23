import { Link } from "react-router-dom";

export default function OrderCard({ order }) {
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

    const estado = order.status || order.estado;
    const fecha = order.created_at || order.fechaCreacion;

    return (
        <div className="glass-panel rounded-2xl border border-border p-5 flex justify-between items-center gap-4 hover:border-primary/30 transition-all duration-300">
            {/* Izquierda */}
            <div className="flex items-center gap-4 min-w-0">
                {/* Número de pedido */}
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                    <span className="text-primary font-mono font-bold text-xs">
                        #{order.id}
                    </span>
                </div>

                <div className="space-y-1 min-w-0">
                    <p className="text-foreground font-display font-bold text-sm">
                        Pedido #{order.id}
                    </p>
                    <p className="text-muted text-xs">
                        {new Date(fecha).toLocaleDateString("es-CL", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                        })}
                    </p>
                    <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium capitalize ${getEstadoBadge(estado)}`}>
                        {estado}
                    </span>
                </div>
            </div>

            {/* Derecha */}
            <div className="text-right space-y-2 flex-shrink-0">
                <p className="price-text font-display font-extrabold text-lg">
                    {CLP.format(order.total)}
                </p>
                <Link
                    to={`/user/orders/${order.id}`}
                    className="inline-block text-xs px-3 py-1.5 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors font-medium"
                >
                    Ver detalle →
                </Link>
            </div>
        </div>
    );
}
