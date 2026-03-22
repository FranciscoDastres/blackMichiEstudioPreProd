// src/user/pages/Orders/OrderCard.jsx
import { Link } from 'react-router-dom';
import { CreditCard } from 'lucide-react';

const statusConfig = {
    pendiente: { label: 'Pendiente', cls: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' },
    pagado: { label: 'Pagado', cls: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
    confirmado: { label: 'Confirmado', cls: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
    en_proceso: { label: 'En proceso', cls: 'bg-orange-500/10 text-orange-400 border-orange-500/20' },
    enviado: { label: 'Enviado', cls: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' },
    entregado: { label: 'Entregado', cls: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
    cancelado: { label: 'Cancelado', cls: 'bg-rose-500/10 text-rose-400 border-rose-500/20' },
};

export default function OrderCard({ order }) {
    const status = statusConfig[order.estado] || { label: order.estado || '—', cls: 'bg-gray-500/10 text-gray-400 border-gray-500/20' };

    return (
        <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-5 flex items-center justify-between hover:border-gray-700 transition-all duration-200">
            <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-sky-500/10 flex items-center justify-center shrink-0">
                    <CreditCard className="w-5 h-5 text-sky-400" />
                </div>
                <div>
                    <p className="font-semibold text-white">Pedido #{order.id}</p>
                    <p className="text-xs text-gray-500 mt-0.5">
                        {new Date(order.created_at).toLocaleDateString('es-CL', { year: 'numeric', month: 'long', day: 'numeric' })}
                    </p>
                    <span className={`inline-block mt-1.5 text-xs px-2 py-0.5 rounded-full border font-medium ${status.cls}`}>
                        {status.label}
                    </span>
                </div>
            </div>
            <div className="text-right">
                <p className="font-bold text-emerald-400 text-lg">
                    ${order.total?.toLocaleString('es-CL')}
                </p>
                <Link
                    to={`/cuenta/pedidos/${order.id}`}
                    className="text-xs text-sky-400 hover:text-sky-300 mt-1 block transition-colors"
                >
                    Ver detalle →
                </Link>
            </div>
        </div>
    );
}