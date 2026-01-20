// components/StatusBadge.jsx
const statusLabels = {
    pendiente: "Pendiente",
    pagado: "Pagado",
    cancelado: "Cancelado",
    admin: "Admin",
    cliente: "Cliente",
};

const statusColors = {
    pendiente: "bg-yellow-100 text-yellow-800",
    pagado: "bg-green-100 text-green-800",
    cancelado: "bg-red-100 text-red-800",
    admin: "bg-black text-white",
    cliente: "bg-gray-200 text-gray-800",
};

export default function StatusBadge({ status }) {
    const normalized = String(status || "pendiente").toLowerCase().trim();
    const label = statusLabels[normalized] || "Desconocido";
    const colorClass = statusColors[normalized] || "bg-gray-100 text-gray-600";

    return (
        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${colorClass}`}>
            {label}
        </span>
    );
}