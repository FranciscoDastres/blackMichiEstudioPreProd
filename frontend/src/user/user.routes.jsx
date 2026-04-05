// src/user/user.routes.jsx
import { Routes, Route, Navigate } from 'react-router-dom';
import UserLayout from './layout/UserLayout';
import Profile from './pages/Account/Profile';
import Security from './pages/Account/Security';
import OrdersPage from './pages/Orders/OrdersPage';
import OrderDetail from './pages/Orders/OrderDetail';
import ReviewsPage from './pages/Reviews/ReviewsPage';

export default function UserRoutes() {
    return (
        <Routes>
            <Route element={<UserLayout />}>
                <Route index element={<Navigate to="perfil" replace />} />
                <Route path="perfil" element={<Profile />} />
                <Route path="seguridad" element={<Security />} />
                <Route path="pedidos" element={<OrdersPage />} />
                <Route path="pedidos/:id" element={<OrderDetail />} />
                <Route path="resenas" element={<ReviewsPage />} />
            </Route>
        </Routes>
    );
}