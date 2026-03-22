import AdminTable from "../components/AdminTable";
import StatusBadge from "../components/StatusBadge";
import useUsers from "../hooks/useUsers";

export default function Users() {
    const { users, loading } = useUsers();

    if (loading) {
        return <p className="text-white p-4">Cargando usuarios...</p>;
    }

    const columns = [
        { header: "ID", accessor: "id" },
        { header: "Email", accessor: "email" },
        {
            header: "Rol",
            accessor: "role",
            cell: (value) => (
                <StatusBadge status={value === "admin" ? "admin" : "cliente"} />
            ),
        },
        {
            header: "Creado",
            accessor: "created_at",
            cell: (value) => new Date(value).toLocaleDateString(),
        },
    ];

    return (
        <div className="p-6 bg-gray-900 min-h-screen text-white">
            <h2 className="text-2xl font-bold mb-4">Usuarios</h2>

            {/* DEBUG (puedes borrar después) */}
            <pre className="mb-4 text-xs bg-black p-2 rounded">
                {JSON.stringify(users, null, 2)}
            </pre>

            <AdminTable columns={columns} data={users} />
        </div>
    );
}