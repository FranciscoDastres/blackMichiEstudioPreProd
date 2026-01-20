import { Routes, Route, Navigate } from "react-router-dom";
import UserLayout from "./layout/UserLayout";

import OrdersPage from "./pages/Orders/OrdersPage";
import OrderDetail from "./pages/Orders/OrderDetail";
import OrderReceipt from "./pages/Orders/OrderReceipt";
import AccountRoutes from "./pages/Account";

export default function UserRoutes() {
    return (
        <Routes>
            <Route element={<UserLayout />}>
                {/* REDIRECCIÓN CLAVE */}
                <Route index element={<Navigate to="orders" replace />} />

                <Route path="orders" element={<OrdersPage />} />
                <Route path="orders/:orderId" element={<OrderDetail />} />
                <Route path="orders/:orderId/receipt" element={<OrderReceipt />} />

                <Route path="account/*" element={<AccountRoutes />} />
            </Route>
        </Routes>
    );
}
