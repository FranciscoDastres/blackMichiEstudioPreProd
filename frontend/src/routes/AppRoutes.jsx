import React, { Suspense } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import { GoogleOAuthProvider } from "@react-oauth/google";
import Layout from "../components/Layout/Layout";
import { lazyWithRetry } from "../utils/lazyWithRetry";

import NotFound from "../components/NotFound/NotFound";
import PaymentReceipt from "../components/PaymentReceipt/PaymentReceipt";
import PrivateRoute from "./PrivateRoute";

const ProductDetail = lazyWithRetry(() => import("../pages/ProductDetail"));
const ProductList = lazyWithRetry(() => import("../pages/ProductList"));
const Login = lazyWithRetry(() => import("../pages/Login"));
const Register = lazyWithRetry(() => import("../pages/Register"));
const ForgotPassword = lazyWithRetry(() => import("../pages/ForgotPassword"));
const ResetPassword = lazyWithRetry(() => import("../pages/ResetPassword"));
const Checkout = lazyWithRetry(() => import("../pages/Checkout"));
const Success = lazyWithRetry(() => import("../pages/Success"));
const Home = lazyWithRetry(() => import("../pages/Home"));
const TermsAndConditions = lazyWithRetry(() => import("../pages/TermsAndConditions"));
const FAQ = lazyWithRetry(() => import("../pages/FAQ"));
const PrivacyPolicy = lazyWithRetry(() => import("../pages/PrivacyPolicy"));

const AdminLayout = lazyWithRetry(() => import("../admin/layout/AdminLayout"));
const AdminDashboard = lazyWithRetry(() => import("../admin/pages/Dashboard"));
const AdminOrders = lazyWithRetry(() => import("../admin/pages/Orders"));
const AdminUsers = lazyWithRetry(() => import("../admin/pages/Users"));
const AdminSettings = lazyWithRetry(() => import("../admin/pages/Settings"));
const AdminCoupons = lazyWithRetry(() => import("../admin/pages/Coupons"));

// ✅ Apunta a la carpeta Products/ correcta
const AdminProducts = lazyWithRetry(() => import("../admin/pages/Products/ProductsPage"));
const AdminProductCreate = lazyWithRetry(() => import("../admin/pages/Products/ProductCreate"));
const AdminProductEdit = lazyWithRetry(() => import("../admin/pages/Products/ProductEdit"));

const UserRoutes = lazyWithRetry(() => import("../user/user.routes"));

// Fallback con Layout completo — solo para rutas admin donde AdminLayout es lazy
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

// Fallback de contenido — usado DENTRO de Layout para no remontar el Header
function PageLoadingFallback() {
  return (
    <div className="flex items-center justify-center min-h-[600px]">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-muted-foreground">Cargando...</p>
      </div>
    </div>
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
      {/* PÚBLICAS — Layout fuera de Suspense para evitar CLS en main */}
      <Route path="/" element={
        <Layout>
          <Suspense fallback={<PageLoadingFallback />}>
            <Home />
          </Suspense>
        </Layout>
      } />
      <Route path="/productos" element={
        <Layout>
          <Suspense fallback={<PageLoadingFallback />}>
            <ProductList />
          </Suspense>
        </Layout>
      } />
      <Route path="/producto/:productId" element={
        <Layout>
          <Suspense fallback={<PageLoadingFallback />}>
            <ProductDetail />
          </Suspense>
        </Layout>
      } />
      <Route path="/checkout" element={
        <Layout>
          <Suspense fallback={<PageLoadingFallback />}>
            <Checkout />
          </Suspense>
        </Layout>
      } />
      <Route path="/login" element={
        <Suspense fallback={<LoadingFallback />}>
          <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
            <Login />
          </GoogleOAuthProvider>
        </Suspense>
      } />
      <Route path="/register" element={
        <Suspense fallback={<LoadingFallback />}>
          <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
            <Register />
          </GoogleOAuthProvider>
        </Suspense>
      } />
      <Route path="/forgot-password" element={
        <Suspense fallback={<LoadingFallback />}>
          <ForgotPassword />
        </Suspense>
      } />
      <Route path="/reset-password" element={
        <Suspense fallback={<LoadingFallback />}>
          <ResetPassword />
        </Suspense>
      } />

      <Route path="/success" element={<SuccessRouteWrapper />} />
      <Route path="/payment/return" element={<PaymentReceipt />} />

      {/* POLÍTICAS Y AYUDA */}
      <Route path="/terminos-y-condiciones" element={
        <Layout>
          <Suspense fallback={<PageLoadingFallback />}>
            <TermsAndConditions />
          </Suspense>
        </Layout>
      } />
      <Route path="/preguntas-frecuentes" element={
        <Layout>
          <Suspense fallback={<PageLoadingFallback />}>
            <FAQ />
          </Suspense>
        </Layout>
      } />
      <Route path="/politica-privacidad" element={
        <Layout>
          <Suspense fallback={<PageLoadingFallback />}>
            <PrivacyPolicy />
          </Suspense>
        </Layout>
      } />

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
        <Route path="coupons" element={
          <Suspense fallback={<LoadingFallback />}>
            <AdminCoupons />
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
    </Routes>
  );
}
