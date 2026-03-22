// src/user/user.routes.jsx
import UserLayout from './layout/UserLayout';
import Profile from './pages/Account/Profile';
import Security from './pages/Account/Security';
import OrdersPage from './pages/Orders/OrdersPage';
import OrderDetail from './pages/Orders/OrderDetail';
import { Navigate } from 'react-router-dom';

const userRoutes = {
    path: '/cuenta',
    element: <UserLayout />,
    children: [
        { index: true, element: <Navigate to="perfil" replace /> },
        { path: 'perfil', element: <Profile /> },
        { path: 'seguridad', element: <Security /> },
        { path: 'pedidos', element: <OrdersPage /> },
        { path: 'pedidos/:id', element: <OrderDetail /> },
    ],
};

export default userRoutes;
