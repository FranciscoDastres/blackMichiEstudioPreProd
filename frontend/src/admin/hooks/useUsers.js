import { useEffect, useState } from "react";

export default function useUsers() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // MOCK (luego API)
        setTimeout(() => {
            setUsers([
                {
                    id: 1,
                    name: "Juan Pérez",
                    email: "juan@example.com",
                    role: "cliente",
                    created_at: "2025-01-01",
                },
                {
                    id: 2,
                    name: "Ana Gómez",
                    email: "ana@example.com",
                    role: "cliente",
                    created_at: "2025-01-02",
                },
            ]);
            setLoading(false);
        }, 400);
    }, []);

    return { users, loading };
}
