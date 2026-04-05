import { useEffect, useState } from "react";
import api from "../../services/api";

export default function useUsers() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        api.get('/admin/usuarios')
            .then(res => setUsers(res.data))
            .catch(err => {
                console.error('Error al cargar usuarios:', err);
                setError('No se pudieron cargar los usuarios');
            })
            .finally(() => setLoading(false));
    }, []);

    return { users, loading, error };
}