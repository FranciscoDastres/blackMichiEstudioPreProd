const columns = [
    { header: "ID", accessor: "id" },
    { header: "Nombre", accessor: "nombre" },
    { header: "Email", accessor: "email" },
    { header: "Teléfono", accessor: "telefono", cell: (v) => v || "—" },
    {
        header: "Rol",
        accessor: "rol",
        cell: (value) => (
            <StatusBadge status={value === "admin" ? "admin" : "cliente"} />
        ),
    },
    {
        header: "Estado",
        accessor: "activo",
        cell: (value) => (
            <StatusBadge status={value ? "activo" : "inactivo"} />
        ),
    },
    {
        header: "Creado",
        accessor: "created_at",
        cell: (value) => new Date(value).toLocaleDateString("es-CL"),
    },
];