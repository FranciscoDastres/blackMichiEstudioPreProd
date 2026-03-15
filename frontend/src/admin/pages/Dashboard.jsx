import { lazy, Suspense } from "react";
import { Link } from "react-router-dom";
import AdminTable from "../components/AdminTable";
import StatusBadge from "../components/StatusBadge";
import useAdminStats from "../hooks/useAdminStats";
import useOrders from "../hooks/useOrders";
import { ShoppingBag, Users, Package, DollarSign, Home, BarChart3, CreditCard } from "lucide-react";

const AddProductForm = lazy(() => import("../components/AddProductForm"));

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

    if (loadingStats || loadingOrders) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-accent"></div>
            </div>
        );
    }

    return (
        <div className="space-y-8 p-4 sm:p-6 bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 min-h-screen">
            <div className="relative z-10">

                <div className="mb-10">
                    <h1 className="text-4xl md:text-5xl font-bold mb-6">
                        <span className="bg-gradient-to-r from-white via-gray-100 to-gray-300 bg-clip-text text-transparent">
                            Panel de Administración
                        </span>
                    </h1>
                    <Link
                        to="/"
                        className="inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-sky-500 to-sky-600 text-white font-semibold rounded-xl transition-all duration-300 hover:shadow-xl hover:shadow-sky-500/30 hover:-translate-y-1"
                    >
                        <Home className="w-5 h-5" />
                        Volver a la tienda
                    </Link>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <div className="bg-gray-900/90 rounded-2xl border border-gray-800 p-6 shadow-xl">
                        <div className="flex items-center justify-between mb-6">
                            <div className="w-12 h-12 rounded-xl bg-sky-500/10 flex items-center justify-center">
                                <DollarSign className="w-6 h-6 text-sky-500" />
                            </div>
                            <div className="text-right">
                                <div className="text-3xl font-bold text-white">${(stats.totalSales || 0).toLocaleString()}</div>
                                <div className="text-sm text-gray-400 mt-1">Ventas Totales</div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-gray-900/90 rounded-2xl border border-gray-800 p-6 shadow-xl">
                        <div className="flex items-center justify-between mb-6">
                            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                                <ShoppingBag className="w-6 h-6 text-emerald-500" />
                            </div>
                            <div className="text-right">
                                <div className="text-3xl font-bold text-white">{stats.orders || 0}</div>
                                <div className="text-sm text-gray-400 mt-1">Total Pedidos</div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-gray-900/90 rounded-2xl border border-gray-800 p-6 shadow-xl">
                        <div className="flex items-center justify-between mb-6">
                            <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center">
                                <Users className="w-6 h-6 text-purple-500" />
                            </div>
                            <div className="text-right">
                                <div className="text-3xl font-bold text-white">{stats.users || 0}</div>
                                <div className="text-sm text-gray-400 mt-1">Usuarios</div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-gray-900/90 rounded-2xl border border-gray-800 p-6 shadow-xl">
                        <div className="flex items-center justify-between mb-6">
                            <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center">
                                <Package className="w-6 h-6 text-amber-500" />
                            </div>
                            <div className="text-right">
                                <div className="text-3xl font-bold text-white">{stats.products || 0}</div>
                                <div className="text-sm text-gray-400 mt-1">Productos</div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-gray-900/80 rounded-2xl border border-gray-800 shadow-xl p-6 md:p-8 mb-8">
                    <div className="flex items-center gap-3 mb-8">
                        <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center">
                            <Package className="w-5 h-5 text-accent" />
                        </div>
                        <div>
                            <h3 className="text-2xl font-bold text-white">Agregar Nuevo Producto</h3>
                            <p className="text-gray-400">Completa el formulario para añadir un producto</p>
                        </div>
                    </div>
                    <div className="bg-gray-900/60 rounded-xl p-6 border border-gray-800">
                        <Suspense fallback={<div className="text-gray-400 text-center py-8">Cargando formulario...</div>}>
                            <AddProductForm />
                        </Suspense>
                    </div>
                </div>

                <div className="bg-gray-900/80 rounded-2xl border border-gray-800 shadow-xl p-6 md:p-8 mb-8">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center">
                                <BarChart3 className="w-5 h-5 text-accent" />
                            </div>
                            <div>
                                <h3 className="text-2xl font-bold text-white">Últimos Pedidos</h3>
                                <p className="text-gray-400">Revisa los pedidos recientes de tu tienda</p>
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

                    <div className="overflow-hidden rounded-xl border border-gray-800 bg-gray-900/60">
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