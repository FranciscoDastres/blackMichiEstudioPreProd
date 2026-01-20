// Users.jsx
import AdminTable from "../components/AdminTable";
import StatusBadge from "../components/StatusBadge";
import useUsers from "../hooks/useUsers";

export default function Users() {
    const { users, loading } = useUsers();

    if (loading) {
        return <p className="text-muted">Cargando usuarios...</p>;
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
        { header: "Creado", accessor: "created_at" },
    ];

    return (
        <div className="space-y-8 p-4 sm:p-6 bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 min-h-screen">
            <h2 className="text-2xl font-bold text-foreground">Usuarios</h2>
            <AdminTable columns={columns} data={users} />
        </div>
    );
}