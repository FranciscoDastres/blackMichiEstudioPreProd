// frontend/src/admin/pages/Dashboard.jsx
import { Link } from "react-router-dom";
import AdminTable from "../components/AdminTable";
import StatusBadge from "../components/StatusBadge";
import useAdminStats from "../hooks/useAdminStats";
import useOrders from "../hooks/useOrders";
import {
    ShoppingBag, Users, Package, DollarSign,
    Home, BarChart3, CreditCard, TrendingUp,
    ArrowRight, PlusCircle, Settings
} from "lucide-react";

export default function Dashboard() {
    const { stats = {}, loading: loadingStats } = useAdminStats();
    const { orders = [], loading: loadingOrders } = useOrders();

    const lastOrders = orders.filter(order => order != null).slice(0, 5);

    const columns = [
        {
            header: "Pedido",
            accessor: "id",
            cell: (value) => (
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-sky-500/10 flex items-center justify-center">
                        <span className="text-xs font-medium text-sky-400">#{value}</span>
                    </div>
                </div>
            )
        },
        {
            header: "Cliente",
            accessor: "comprador_nombre",
            cell: (value, row) => (
                <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-purple-500/10 flex items-center justify-center">
                        <Users className="w-3.5 h-3.5 text-purple-400" />
                    </div>
                    <span className="font-medium text-gray-200">
                        {row?.comprador_nombre || row?.comprador_email || "Cliente invitado"}
                    </span>
                </div>
            )
        },
        {
            header: "Total",
            accessor: "total",
            cell: (value, row) => (
                <div className="flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-emerald-400" />
                    <span className="font-bold text-emerald-400">
                        ${Number(row?.total || 0).toLocaleString('es-CL')}
                    </span>
                </div>
            )
        },
        {
            header: "Estado",
            accessor: "estado",
            cell: (value) => <StatusBadge status={value} />
        },
    ];

    const statCards = [
        {
            label: "Ventas Totales",
            value: `$${(stats.totalSales || 0).toLocaleString('es-CL')}`,
            icon: DollarSign,
            color: "sky",
            bg: "bg-sky-500/10",
            text: "text-sky-400",
            border: "border-sky-500/20",
        },
        {
            label: "Total Pedidos",
            value: stats.orders || 0,
            icon: ShoppingBag,
            color: "emerald",
            bg: "bg-emerald-500/10",
            text: "text-emerald-400",
            border: "border-emerald-500/20",
        },
        {
            label: "Usuarios",
            value: stats.users || 0,
            icon: Users,
            color: "purple",
            bg: "bg-purple-500/10",
            text: "text-purple-400",
            border: "border-purple-500/20",
        },
        {
            label: "Productos",
            value: stats.products || 0,
            icon: Package,
            color: "amber",
            bg: "bg-amber-500/10",
            text: "text-amber-400",
            border: "border-amber-500/20",
        },
    ];

    if (loadingStats || loadingOrders) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center space-y-4">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-sky-500 mx-auto"></div>
                    <p className="text-gray-400 text-sm">Cargando dashboard...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8 p-4 sm:p-6">

            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-white via-gray-100 to-gray-400 bg-clip-text text-transparent">
                        Panel de Control
                    </h1>
                    <p className="text-gray-400 mt-1 text-sm">
                        {new Date().toLocaleDateString('es-CL', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    </p>
                </div>
                <Link
                    to="/"
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-gray-800 hover:bg-gray-700 text-gray-200 font-medium rounded-xl transition-all duration-300 border border-gray-700 hover:border-gray-600 text-sm"
                >
                    <Home className="w-4 h-4" />
                    Ver tienda
                </Link>
            </div>

            {/* Stat cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {statCards.map(({ label, value, icon: Icon, bg, text, border }) => (
                    <div key={label} className={`bg-gray-900/80 rounded-2xl border ${border} p-5 shadow-xl hover:scale-[1.02] transition-transform duration-300`}>
                        <div className="flex items-center justify-between mb-4">
                            <div className={`w-11 h-11 rounded-xl ${bg} flex items-center justify-center`}>
                                <Icon className={`w-5 h-5 ${text}`} />
                            </div>
                            <TrendingUp className="w-4 h-4 text-gray-600" />
                        </div>
                        <div className={`text-2xl font-bold ${text} mb-1`}>{value}</div>
                        <div className="text-xs text-gray-500 uppercase tracking-wider">{label}</div>
                    </div>
                ))}
            </div>

            {/* Accesos rápidos */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Link
                    to="/admin/products/create"
                    className="group flex items-center gap-4 p-5 bg-gray-900/80 rounded-2xl border border-sky-500/20 hover:border-sky-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-sky-500/10"
                >
                    <div className="w-11 h-11 rounded-xl bg-sky-500/10 flex items-center justify-center group-hover:bg-sky-500/20 transition-colors">
                        <PlusCircle className="w-5 h-5 text-sky-400" />
                    </div>
                    <div className="flex-1">
                        <p className="font-semibold text-white text-sm">Crear Producto</p>
                        <p className="text-xs text-gray-500">Agregar nuevo producto</p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-gray-600 group-hover:text-sky-400 group-hover:translate-x-1 transition-all" />
                </Link>

                <Link
                    to="/admin/products"
                    className="group flex items-center gap-4 p-5 bg-gray-900/80 rounded-2xl border border-amber-500/20 hover:border-amber-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-amber-500/10"
                >
                    <div className="w-11 h-11 rounded-xl bg-amber-500/10 flex items-center justify-center group-hover:bg-amber-500/20 transition-colors">
                        <Package className="w-5 h-5 text-amber-400" />
                    </div>
                    <div className="flex-1">
                        <p className="font-semibold text-white text-sm">Ver Productos</p>
                        <p className="text-xs text-gray-500">{stats.products || 0} productos activos</p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-gray-600 group-hover:text-amber-400 group-hover:translate-x-1 transition-all" />
                </Link>

                <Link
                    to="/admin/settings"
                    className="group flex items-center gap-4 p-5 bg-gray-900/80 rounded-2xl border border-purple-500/20 hover:border-purple-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/10"
                >
                    <div className="w-11 h-11 rounded-xl bg-purple-500/10 flex items-center justify-center group-hover:bg-purple-500/20 transition-colors">
                        <Settings className="w-5 h-5 text-purple-400" />
                    </div>
                    <div className="flex-1">
                        <p className="font-semibold text-white text-sm">Configuración</p>
                        <p className="text-xs text-gray-500">Hero images y ajustes</p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-gray-600 group-hover:text-purple-400 group-hover:translate-x-1 transition-all" />
                </Link>
            </div>

            {/* Últimos pedidos */}
            <div className="bg-gray-900/80 rounded-2xl border border-gray-800 shadow-xl p-6 md:p-8">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-sky-500/10 flex items-center justify-center">
                            <BarChart3 className="w-5 h-5 text-sky-400" />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-white">Últimos Pedidos</h3>
                            <p className="text-gray-500 text-xs">Actividad reciente de tu tienda</p>
                        </div>
                    </div>
                    {lastOrders.length > 0 && (
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-sky-500/10 border border-sky-500/20">
                            <div className="w-2 h-2 rounded-full bg-sky-400 animate-pulse"></div>
                            <span className="text-xs font-medium text-sky-400">
                                {lastOrders.length} reciente{lastOrders.length !== 1 ? 's' : ''}
                            </span>
                        </div>
                    )}
                </div>

                {lastOrders.length > 0 ? (
                    <div className="overflow-hidden rounded-xl border border-gray-800 bg-gray-900/60">
                        <AdminTable columns={columns} data={lastOrders} />
                    </div>
                ) : (
                    <div className="text-center py-12">
                        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-800 flex items-center justify-center">
                            <ShoppingBag className="w-8 h-8 text-gray-600" />
                        </div>
                        <p className="text-gray-400 text-lg">No hay pedidos recientes</p>
                        <p className="text-sm text-gray-600 mt-2">Los nuevos pedidos aparecerán aquí</p>
                    </div>
                )}
            </div>

        </div>
    );
}
