import AdminTable from "../components/AdminTable";
import StatusBadge from "../components/StatusBadge";
import useOrders from "../hooks/useOrders";

const ESTADOS = [
    { value: "pendiente",   label: "Pendiente" },
    { value: "pagado",      label: "Pagado" },
    { value: "confirmado",  label: "Confirmado" },
    { value: "en_proceso",  label: "En proceso" },
    { value: "enviado",     label: "Enviado" },
    { value: "entregado",   label: "Entregado" },
    { value: "cancelado",   label: "Cancelado" },
    { value: "rechazado",   label: "Rechazado" },
];

const ESTADOS_TERMINALES = ["cancelado", "rechazado", "entregado"];

function OrderStatusSelect({ orderId, estadoActual, onUpdate }) {
    const esTerminal = ESTADOS_TERMINALES.includes(estadoActual);

    if (esTerminal) {
        return (
            <span className="text-xs text-gray-500 italic">
                {estadoActual === "entregado" ? "Completado" : "Cerrado"}
            </span>
        );
    }

    return (
        <select
            defaultValue={estadoActual}
            onChange={(e) => {
                const nuevoEstado = e.target.value;
                if (nuevoEstado !== estadoActual) {
                    onUpdate(orderId, nuevoEstado);
                }
            }}
            className="bg-gray-800 border border-gray-600 text-white text-xs rounded px-2 py-1.5 focus:outline-none focus:border-blue-500 cursor-pointer"
        >
            {ESTADOS.map((e) => (
                <option key={e.value} value={e.value}>
                    {e.label}
                </option>
            ))}
        </select>
    );
}

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
            header: "Cambiar estado",
            cell: (value, row) => (
                <OrderStatusSelect
                    orderId={row.id}
                    estadoActual={String(row?.estado || "pendiente").toLowerCase()}
                    onUpdate={updateOrderStatus}
                />
            ),
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
