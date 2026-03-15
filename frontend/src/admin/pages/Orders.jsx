import AdminTable from "../components/AdminTable";
import StatusBadge from "../components/StatusBadge";
import useOrders from "../hooks/useOrders";

export default function Orders() {
    const { orders, loading, error, updateOrderStatus } = useOrders();

    if (loading) {
        return (
            <div className="p-10 text-center text-white">
                Cargando pedidos...
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-10 text-center text-red-500 font-bold">
                Error: {error}
            </div>
        );
    }

    const columns = [
        { header: "ID", accessor: "id" },
        {
            header: "Cliente",
            accessor: "comprador_nombre",
            cell: (value, row) => (
                <div className="flex flex-col">
                    <span className="font-medium">{row?.comprador_nombre}</span>
                    <span className="text-xs text-muted-foreground">
                        {row?.direccion_envio || "Sin dirección"}
                    </span>
                </div>
            ),
        },
        {
            header: "Estado",
            accessor: "estado",
            cell: (value) => <StatusBadge status={value} />,
        },
        {
            header: "Total",
            accessor: "total",
            cell: (value, row) => {
                const monto = Number(row?.total || 0);
                return `$${monto.toLocaleString("es-CL")}`;
            },
        },
        {
            header: "Acciones",
            cell: (value, row) => {
                const estadoActual = String(row?.estado || "").toLowerCase();

                if (estadoActual !== "pendiente") {
                    return (
                        <span className="text-xs text-gray-500 italic">
                            Procesado
                        </span>
                    );
                }

                return (
                    <div className="flex gap-2">
                        <button
                            onClick={() => updateOrderStatus(row.id, "pagado")}
                            className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded shadow-sm transition-colors text-xs font-medium"
                        >
                            Aprobar
                        </button>

                        <button
                            onClick={() => updateOrderStatus(row.id, "cancelado")}
                            className="px-3 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded shadow-sm transition-colors text-xs font-medium"
                        >
                            Anular
                        </button>
                    </div>
                );
            },
        },
    ];

    return (
        <div className="space-y-8 p-4 sm:p-6 bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 min-h-screen">
            <div className="space-y-8">
                <div className="flex justify-between items-center">
                    <h2 className="text-3xl font-bold">Gestión de Pedidos</h2>

                    <div className="text-sm bg-gray-900/70 border border-gray-800 px-4 py-2 rounded-lg backdrop-blur">
                        Total: {orders.length} pedidos
                    </div>
                </div>

                <div className="bg-gray-900/50 border border-gray-800 rounded-2xl overflow-hidden backdrop-blur">
                    <AdminTable columns={columns} data={orders} />
                </div>
            </div>
        </div>
    );
}
