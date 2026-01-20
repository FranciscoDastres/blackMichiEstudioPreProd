import { Link } from "react-router-dom";
import AdminTable from "../components/AdminTable";
import StatusBadge from "../components/StatusBadge";
import AddProductForm from "../components/AddProductForm";
import useAdminStats from "../hooks/useAdminStats";
import useOrders from "../hooks/useOrders";
import { TrendingUp, ShoppingBag, Users, Package, DollarSign, Home, BarChart3, CreditCard } from "lucide-react";

const columns = [
    {
        header: "Pedido",
        accessor: "id",
        cell: (value) => (
            <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center">
                    <span className="text-xs font-medium text-accent">#{value}</span>
                </div>
            </div>
        )
    },
    {
        header: "Cliente",
        accessor: "comprador_nombre",
        cell: (value, row) => (
            <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-muted-foreground" />
                <span className="font-medium">
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
                <CreditCard className="w-4 h-4 text-emerald-500" />
                <span className="font-bold text-foreground">
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

export default function Dashboard() {
    const { stats = {}, loading: loadingStats } = useAdminStats();
    const { orders = [], loading: loadingOrders, error: ordersError } = useOrders();

    const lastOrders = orders.filter(order => order != null).slice(0, 5);

    if (loadingStats || loadingOrders) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 flex items-center justify-center">
                <div className="relative">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-accent"></div>
                    <div className="absolute inset-0 animate-ping rounded-full border-2 border-accent/30"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8 p- sm:p-6 bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 min-h-screen">
            {/* Fondo con patrón sutil */}
            <div className="absolute inset-0 opacity-5 z-0 pointer-events-none"
                style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z' fill='%23ffffff' fill-opacity='0.4' fill-rule='evenodd'/%3E%3C/svg%3E")`,
                    backgroundSize: '60px 60px'
                }}>
            </div>

            {/* Efectos de luz */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-accent/5 via-transparent to-transparent rounded-full blur-3xl -z-10"></div>
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-sky-500/5 via-transparent to-transparent rounded-full blur-3xl -z-10"></div>

            {/* Contenido principal */}
            <div className="relative z-10">
                {/* Header */}
                <div className="mb-10">
                    <div className="mb-6">
                        <h1 className="text-4xl md:text-5xl font-bold mb-3">
                            <span className="bg-gradient-to-r from-white via-gray-100 to-gray-300 bg-clip-text text-transparent">
                                Panel de Administración
                            </span>
                        </h1>
                    </div>

                    <Link
                        to="/"
                        className="group relative inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-sky-500 to-sky-600 text-white font-semibold rounded-xl overflow-hidden transition-all duration-300 hover:shadow-xl hover:shadow-sky-500/30 hover:-translate-y-1"
                    >
                        <Home className="w-5 h-5 relative z-10" />
                        <span className="relative z-10">Volver a la tienda</span>
                        <div className="absolute inset-0 bg-gradient-to-r from-sky-600 to-sky-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    </Link>
                </div>

                {/* Cards de estadísticas */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <div className="group relative bg-gradient-to-br from-gray-900/90 via-gray-900/80 to-gray-900/90 rounded-2xl border border-gray-800 p-6 shadow-xl hover:shadow-2xl hover:shadow-sky-500/10 transition-all duration-500 hover:-translate-y-1 overflow-hidden">
                        <div className="absolute -top-10 -right-10 w-20 h-20 bg-gradient-to-br from-sky-500/20 to-transparent rounded-full blur-xl"></div>
                        <div className="relative z-10">
                            <div className="flex items-center justify-between mb-6">
                                <div className="w-12 h-12 rounded-xl bg-sky-500/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                                    <DollarSign className="w-6 h-6 text-sky-500" />
                                </div>
                                <div className="text-right">
                                    <div className="text-3xl font-bold text-white">
                                        ${(stats.totalSales || 0).toLocaleString()}
                                    </div>
                                    <div className="text-sm text-gray-400 mt-1">Ventas Totales</div>
                                </div>
                            </div>
                            <div className="text-xs text-gray-400 border-t border-gray-800 pt-4 mt-2">
                                Total acumulado en ventas
                            </div>
                        </div>
                    </div>

                    <div className="group relative bg-gradient-to-br from-gray-900/90 via-gray-900/80 to-gray-900/90 rounded-2xl border border-gray-800 p-6 shadow-xl hover:shadow-2xl hover:shadow-emerald-500/10 transition-all duration-500 hover:-translate-y-1 overflow-hidden">
                        <div className="absolute -top-10 -right-10 w-20 h-20 bg-gradient-to-br from-emerald-500/20 to-transparent rounded-full blur-xl"></div>
                        <div className="relative z-10">
                            <div className="flex items-center justify-between mb-6">
                                <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                                    <ShoppingBag className="w-6 h-6 text-emerald-500" />
                                </div>
                                <div className="text-right">
                                    <div className="text-3xl font-bold text-white">
                                        {stats.orders || 0}
                                    </div>
                                    <div className="text-sm text-gray-400 mt-1">Total Pedidos</div>
                                </div>
                            </div>
                            <div className="text-xs text-gray-400 border-t border-gray-800 pt-4 mt-2">
                                Pedidos procesados
                            </div>
                        </div>
                    </div>

                    <div className="group relative bg-gradient-to-br from-gray-900/90 via-gray-900/80 to-gray-900/90 rounded-2xl border border-gray-800 p-6 shadow-xl hover:shadow-2xl hover:shadow-purple-500/10 transition-all duration-500 hover:-translate-y-1 overflow-hidden">
                        <div className="absolute -top-10 -right-10 w-20 h-20 bg-gradient-to-br from-purple-500/20 to-transparent rounded-full blur-xl"></div>
                        <div className="relative z-10">
                            <div className="flex items-center justify-between mb-6">
                                <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                                    <Users className="w-6 h-6 text-purple-500" />
                                </div>
                                <div className="text-right">
                                    <div className="text-3xl font-bold text-white">
                                        {stats.users || 0}
                                    </div>
                                    <div className="text-sm text-gray-400 mt-1">Usuarios</div>
                                </div>
                            </div>
                            <div className="text-xs text-gray-400 border-t border-gray-800 pt-4 mt-2">
                                Usuarios en la plataforma
                            </div>
                        </div>
                    </div>

                    <div className="group relative bg-gradient-to-br from-gray-900/90 via-gray-900/80 to-gray-900/90 rounded-2xl border border-gray-800 p-6 shadow-xl hover:shadow-2xl hover:shadow-amber-500/10 transition-all duration-500 hover:-translate-y-1 overflow-hidden">
                        <div className="absolute -top-10 -right-10 w-20 h-20 bg-gradient-to-br from-amber-500/20 to-transparent rounded-full blur-xl"></div>
                        <div className="relative z-10">
                            <div className="flex items-center justify-between mb-6">
                                <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                                    <Package className="w-6 h-6 text-amber-500" />
                                </div>
                                <div className="text-right">
                                    <div className="text-3xl font-bold text-white">
                                        {stats.products || 0}
                                    </div>
                                    <div className="text-sm text-gray-400 mt-1">Productos</div>
                                </div>
                            </div>
                            <div className="text-xs text-gray-400 border-t border-gray-800 pt-4 mt-2">
                                Productos disponibles
                            </div>
                        </div>
                    </div>
                </div>

                {/* Sección agregar producto */}
                <div className="bg-gradient-to-br from-gray-900/80 via-gray-900/70 to-gray-900/80 rounded-2xl border border-gray-800 shadow-xl p-6 md:p-8 mb-8">
                    <div className="mb-8">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center">
                                <Package className="w-5 h-5 text-accent" />
                            </div>
                            <div>
                                <h3 className="text-2xl font-bold mb-1">
                                    <span className="bg-gradient-to-r from-white via-gray-200 to-gray-300 bg-clip-text text-transparent">
                                        Agregar Nuevo Producto
                                    </span>
                                </h3>
                                <p className="text-lg text-gray-400">Completa el formulario para añadir un producto a tu catálogo</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-gray-900/60 backdrop-blur-sm rounded-xl p-6 border border-gray-800">
                        <AddProductForm />
                    </div>
                </div>

                {/* Tabla pedidos */}
                <div className="bg-gradient-to-br from-gray-900/80 via-gray-900/70 to-gray-900/80 rounded-2xl border border-gray-800 shadow-xl p-6 md:p-8 mb-8">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center">
                                <BarChart3 className="w-5 h-5 text-accent" />
                            </div>
                            <div>
                                <h3 className="text-2xl font-bold mb-1">
                                    <span className="bg-gradient-to-r from-white via-gray-200 to-gray-300 bg-clip-text text-transparent">
                                        Últimos Pedidos
                                    </span>
                                </h3>
                                <p className="text-lg text-gray-400">Revisa los pedidos recientes de tu tienda</p>
                            </div>
                        </div>

                        {lastOrders.length > 0 && (
                            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 border border-accent/20">
                                <div className="w-2 h-2 rounded-full bg-accent animate-pulse"></div>
                                <span className="text-sm font-medium text-accent">
                                    {lastOrders.length} pedido{lastOrders.length !== 1 ? 's' : ''} reciente{lastOrders.length !== 1 ? 's' : ''}
                                </span>
                            </div>
                        )}
                    </div>

                    <div className="overflow-hidden rounded-xl border border-gray-800 bg-gray-900/60 backdrop-blur-sm">
                        <AdminTable columns={columns} data={lastOrders} />
                    </div>

                    {lastOrders.length === 0 && (
                        <div className="text-center py-12">
                            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-accent/10 flex items-center justify-center">
                                <ShoppingBag className="w-8 h-8 text-accent" />
                            </div>
                            <p className="text-gray-400 text-lg">No hay pedidos recientes</p>
                            <p className="text-sm text-gray-500 mt-2">Los nuevos pedidos aparecerán aquí</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}