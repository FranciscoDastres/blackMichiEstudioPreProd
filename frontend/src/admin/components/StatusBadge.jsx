const statusLabels = {
    pendiente: "Pendiente",
    pagado: "Pagado",
    cancelado: "Cancelado",
    confirmado: "Confirmado",
    en_proceso: "En proceso",
    enviado: "Enviado",
    entregado: "Entregado",
    rechazado: "Rechazado",
    admin: "Admin",
    cliente: "Cliente",
    activo: "Activo",
    inactivo: "Inactivo",
};

const statusColors = {
    pendiente: "bg-yellow-500 text-black",
    pagado: "bg-green-500 text-white",
    cancelado: "bg-red-500 text-white",
    confirmado: "bg-blue-500 text-white",
    en_proceso: "bg-orange-500 text-white",
    enviado: "bg-indigo-500 text-white",
    entregado: "bg-emerald-500 text-white",
    rechazado: "bg-red-700 text-white",
    admin: "bg-blue-600 text-white",
    cliente: "bg-gray-400 text-black",
    activo: "bg-emerald-500 text-white",
    inactivo: "bg-red-500 text-white",
};

export default function StatusBadge({ status }) {
    const normalized = String(status ?? "").toLowerCase().trim();
    const label = statusLabels[normalized] || normalized || "—";
    const colorClass = statusColors[normalized] || "bg-gray-500 text-white";
    return (
        <span className={`px-2 py-1 rounded text-xs font-bold ${colorClass}`}>
            {label}
        </span>
    );
}