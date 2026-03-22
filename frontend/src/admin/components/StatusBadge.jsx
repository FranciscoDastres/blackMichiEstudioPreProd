const statusLabels = {
    pendiente: "Pendiente",
    pagado: "Pagado",
    cancelado: "Cancelado",
    admin: "Admin",
    cliente: "Cliente",
};

const statusColors = {
    pendiente: "bg-yellow-500 text-black",
    pagado: "bg-green-500 text-white",
    cancelado: "bg-red-500 text-white",
    admin: "bg-blue-600 text-white",
    cliente: "bg-gray-400 text-black",
};

export default function StatusBadge({ status }) {
    const normalized = String(status || "pendiente").toLowerCase().trim();
    const label = statusLabels[normalized] || "Desconocido";
    const colorClass = statusColors[normalized] || "bg-gray-500 text-white";

    return (
        <span className={`px-2 py-1 rounded text-xs font-bold ${colorClass}`}>
            {label}
        </span>
    );
}