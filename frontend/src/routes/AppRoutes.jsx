//appRoutes.jsx
import React from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import Layout from "../components/Layout/Layout";

import Home from "../pages/Home";
import ProductDetail from "../pages/ProductDetail";
import ProductList from "../pages/ProductList";
import Login from "../pages/Login";
import Register from "../pages/Register";
import Checkout from "../pages/Checkout";
import Success from "../pages/Success";

import NotFound from "../components/NotFound/NotFound";
import PaymentReceipt from "../components/PaymentReceipt/PaymentReceipt";

import PrivateRoute from "./PrivateRoute";

// ✅ RUTAS REALES
import AdminRoutes from "../admin/admin.routes";
import UserRoutes from "../user/user.routes";

/* ------------------ helpers ------------------ */

function SuccessRouteWrapper() {
  const { state } = useLocation();

  return (
    <Layout>
      <Success
        message={state?.message || "¡Acción exitosa!"}
        actionText={state?.actionText}
        actionTo={state?.actionTo}
      />
    </Layout>
  );
}

/* ------------------ routes ------------------ */

export default function AppRoutes() {
  return (
    <Routes>
      {/* 🌐 PÚBLICAS */}
      <Route path="/" element={<Layout><Home /></Layout>} />
      <Route path="/productos" element={<Layout><ProductList /></Layout>} />
      <Route path="/producto/:productId" element={<Layout><ProductDetail /></Layout>} />
      <Route path="/checkout" element={<Layout><Checkout /></Layout>} />

      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/success" element={<SuccessRouteWrapper />} />

      {/* 💳 Retorno de pago */}
      <Route path="/payment/return" element={<PaymentReceipt />} />

      {/* 🔐 ADMIN */}
      <Route
        path="/admin/*"
        element={
          <PrivateRoute requiredRole="admin">
            <AdminRoutes />
          </PrivateRoute>
        }
      />

      {/* 👤 USER / CLIENTE */}
      <Route
        path="/user/*"
        element={
          <PrivateRoute requiredRole="cliente">
            <UserRoutes />
          </PrivateRoute>
        }
      />

      {/* ❌ 404 */}
      <Route path="*" element={<Layout><NotFound /></Layout>} />
    </Routes>
  );
}
