import { Link } from 'react-router-dom';
import { CreditCard } from 'lucide-react';

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

export default function OrderCard({ order }) {
    const status = statusConfig[order.estado] || {
        label: order.estado || '—',
        cls: 'bg-gray-500/20 text-gray-400 border border-gray-500/30'
    };

    return (
        <div className="glass-panel rounded-2xl border border-border p-5 flex items-center justify-between gap-4 hover:border-primary/30 transition-all duration-300">
            {/* Izquierda */}
            <div className="flex items-center gap-4 min-w-0">
                <div className="w-11 h-11 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                    <CreditCard className="w-5 h-5 text-primary" />
                </div>

                <div className="min-w-0">
                    <p className="font-display font-bold text-foreground">
                        Pedido #{order.id}
                    </p>
                    <p className="text-xs text-muted mt-0.5">
                        {new Date(order.created_at).toLocaleDateString('es-CL', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                        })}
                    </p>
                    <span className={`inline-block mt-1.5 text-xs px-2.5 py-0.5 rounded-full font-medium ${status.cls}`}>
                        {status.label}
                    </span>
                </div>
            </div>

            {/* Derecha */}
            <div className="text-right flex-shrink-0 space-y-1.5">
                <p className="price-text font-display font-extrabold text-lg">
                    {CLP.format(order.total)}
                </p>
                <Link
                    to={`/cuenta/pedidos/${order.id}`}
                    className="inline-block text-xs px-3 py-1.5 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors font-medium"
                >
                    Ver detalle →
                </Link>
            </div>
        </div>
    );
}
