import { useEffect, useState } from "react";
import api from "../../services/api";
import type { User } from "../../types";

export default function useUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.get<User[]>('/admin/usuarios')
      .then(res => setUsers(res.data))
      .catch(err => {
        console.error('Error al cargar usuarios:', err);
        setError('No se pudieron cargar los usuarios');
      })
      .finally(() => setLoading(false));
  }, []);

  return { users, loading, error };
}
