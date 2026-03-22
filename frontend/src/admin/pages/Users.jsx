// frontend/src/admin/pages/Users.jsx
import AdminTable from "../components/AdminTable";
import StatusBadge from "../components/StatusBadge";
import useUsers from "../hooks/useUsers";

export default function Users() {
    const { users, loading, error } = useUsers();

    if (loading) return <p className="text-white p-4">Cargando usuarios...</p>;
    if (error) return <p className="text-red-500 p-4">{error}</p>;

    const columns = [
        { header: "ID", accessor: "id" },
        { header: "Nombre", accessor: "nombre" },
        { header: "Email", accessor: "email" },
        { header: "Teléfono", accessor: "telefono", cell: (v) => v || "—" },
        {
            header: "Rol",
            accessor: "rol",
            cell: (value) => <StatusBadge status={value === "admin" ? "admin" : "cliente"} />,
        },
        {
            header: "Estado",
            accessor: "activo",
            cell: (value) => <StatusBadge status={value ? "activo" : "inactivo"} />,
        },
        {
            header: "Creado",
            accessor: "created_at",
            cell: (value) => new Date(value).toLocaleDateString("es-CL"),
        },
    ];

    return (
        <div className="space-y-6 p-4 sm:p-6">
            <div className="flex justify-between items-center">
                <h2 className="text-3xl font-bold text-white">Usuarios</h2>
                <div className="text-sm bg-gray-900/70 border border-gray-800 px-4 py-2 rounded-lg text-gray-400">
                    Total: {users.length} usuarios
                </div>
            </div>
            <div className="bg-gray-900/50 border border-gray-800 rounded-2xl overflow-hidden">
                <AdminTable columns={columns} data={users} />
            </div>
        </div>
    );
}