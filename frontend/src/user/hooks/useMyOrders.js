// src/user/hooks/useMyOrders.js
import { useState, useEffect } from 'react';
import api from '../../services/api';

function useMyOrders() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            setLoading(false);
            return;
        }
        api.get('/orders/my-orders')
            .then(res => setOrders(res.data))
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    return { orders, loading };
}

export { useMyOrders };
export default useMyOrders;