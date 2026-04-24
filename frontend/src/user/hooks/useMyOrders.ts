import { useState, useEffect } from 'react';
import api from '../../services/api';
import type { Order } from '../../types';

function useMyOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      setLoading(false);
      return;
    }
    api.get<Order[]>('/orders/my-orders')
      .then(res => setOrders(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return { orders, loading };
}

export { useMyOrders };
export default useMyOrders;
