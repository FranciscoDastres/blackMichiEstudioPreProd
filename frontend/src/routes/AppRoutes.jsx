import React, { Suspense, lazy } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import Layout from "../components/Layout/Layout";

import NotFound from "../components/NotFound/NotFound";
import PaymentReceipt from "../components/PaymentReceipt/PaymentReceipt";
import PrivateRoute from "./PrivateRoute";
import TermsAndConditions from "../pages/TermsAndConditions";

const ProductDetail = lazy(() => import("../pages/ProductDetail"));
const ProductList = lazy(() => import("../pages/ProductList"));
const Login = lazy(() => import("../pages/Login"));
const Register = lazy(() => import("../pages/Register"));
const Checkout = lazy(() => import("../pages/Checkout"));
const Success = lazy(() => import("../pages/Success"));
const Home = lazy(() => import("../pages/Home"));

const AdminLayout = lazy(() => import("../admin/layout/AdminLayout"));
const AdminDashboard = lazy(() => import("../admin/pages/Dashboard"));
const AdminOrders = lazy(() => import("../admin/pages/Orders"));
const AdminUsers = lazy(() => import("../admin/pages/Users"));
const AdminSettings = lazy(() => import("../admin/pages/Settings"));

// ✅ Apunta a la carpeta Products/ correcta
const AdminProducts = lazy(() => import("../admin/pages/Products/ProductsPage"));
const AdminProductCreate = lazy(() => import("../admin/pages/Products/ProductCreate"));
const AdminProductEdit = lazy(() => import("../admin/pages/Products/ProductEdit"));

const UserRoutes = lazy(() => import("../user/user.routes"));

function LoadingFallback() {
  return (
    <Layout>
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Cargando...</p>
        </div>
      </div>
    </Layout>
  );
}

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

export default function AppRoutes() {
  return (
    <Routes>
      {/* PÚBLICAS */}
      <Route path="/" element={
        <Suspense fallback={<LoadingFallback />}>
          <Layout><Home /></Layout>
        </Suspense>
      } />
      <Route path="/productos" element={
        <Suspense fallback={<LoadingFallback />}>
          <Layout><ProductList /></Layout>
        </Suspense>
      } />
      <Route path="/producto/:productId" element={
        <Suspense fallback={<LoadingFallback />}>
          <Layout><ProductDetail /></Layout>
        </Suspense>
      } />
      <Route path="/checkout" element={
        <Suspense fallback={<LoadingFallback />}>
          <Layout><Checkout /></Layout>
        </Suspense>
      } />
      <Route path="/login" element={
        <Suspense fallback={<LoadingFallback />}>
          <Login />
        </Suspense>
      } />
      <Route path="/register" element={
        <Suspense fallback={<LoadingFallback />}>
          <Register />
        </Suspense>
      } />

      <Route path="/success" element={<SuccessRouteWrapper />} />
      <Route path="/payment/return" element={<PaymentReceipt />} />

      {/* ADMIN */}
      <Route
        path="/admin"
        element={
          <Suspense fallback={<LoadingFallback />}>
            <PrivateRoute requiredRole="admin">
              <AdminLayout />
            </PrivateRoute>
          </Suspense>
        }
      >
        <Route index element={
          <Suspense fallback={<LoadingFallback />}>
            <AdminDashboard />
          </Suspense>
        } />
        <Route path="orders" element={
          <Suspense fallback={<LoadingFallback />}>
            <AdminOrders />
          </Suspense>
        } />
        <Route path="users" element={
          <Suspense fallback={<LoadingFallback />}>
            <AdminUsers />
          </Suspense>
        } />
        {/* ✅ Rutas de productos */}
        <Route path="products" element={
          <Suspense fallback={<LoadingFallback />}>
            <AdminProducts />
          </Suspense>
        } />
        <Route path="products/create" element={
          <Suspense fallback={<LoadingFallback />}>
            <AdminProductCreate />
          </Suspense>
        } />
        <Route path="products/edit/:productId" element={
          <Suspense fallback={<LoadingFallback />}>
            <AdminProductEdit />
          </Suspense>
        } />
        <Route path="settings" element={
          <Suspense fallback={<LoadingFallback />}>
            <AdminSettings />
          </Suspense>
        } />
      </Route>

      {/* USER */}
      <Route
        path="/cuenta/*"
        element={
          <Suspense fallback={<LoadingFallback />}>
            <PrivateRoute requiredRole="cliente">
              <UserRoutes />
            </PrivateRoute>
          </Suspense>
        }
      />

      {/* 404 */}
      <Route path="*" element={<Layout><NotFound /></Layout>} />


      {/* Terminos y con diciones */}
      <Route path="/terminos-y-condiciones" element={<TermsAndConditions />} />
    </Routes>
  );
}
