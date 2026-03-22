// src/user/hooks/useMyOrders.js
import { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import api from '../../services/api';

function useMyOrders() {
    const { token } = useAuth();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!token) return;
        api.get('/orders/my-orders', {
            headers: { Authorization: `Bearer ${token}` }
        })
            .then(res => setOrders(res.data))
            .catch(console.error)
            .finally(() => setLoading(false));
    }, [token]);

    return { orders, loading };
}

export { useMyOrders };      // named  → import { useMyOrders } from '...'
export default useMyOrders;  // default → import useMyOrders from '...'