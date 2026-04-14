// frontend/src/main.jsx
import React, { StrictMode } from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { HelmetProvider } from "react-helmet-async";
import { Toaster } from "sonner";
import * as Sentry from "@sentry/react";
import App from "./App";
import { CartProvider } from "./contexts/CartContext";
import { AuthProvider } from "./contexts/AuthContext";
import { FavoritesProvider } from "./contexts/FavoritesContext";
import ErrorBoundary from "./components/ErrorBoundary/ErrorBoundary";
import { initHoverImageLoading, initIntersectionObserver } from "./utils/lazyImageLoader";
import { initAnalytics, reportWebVitals } from "./utils/analytics";
import "./index.css";

if (import.meta.env.VITE_SENTRY_DSN) {
  Sentry.init({
    dsn: import.meta.env.VITE_SENTRY_DSN,
    environment: import.meta.env.MODE,
    integrations: [Sentry.browserTracingIntegration()],
    tracesSampleRate: Number(import.meta.env.VITE_SENTRY_TRACES_SAMPLE_RATE ?? 0.1),
  });
}

initAnalytics();
reportWebVitals();
initHoverImageLoading();
initIntersectionObserver();

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

ReactDOM.createRoot(document.getElementById("root")).render(
  <StrictMode>
    <HelmetProvider>
    <ErrorBoundary>
      <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
        <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <AuthProvider>
            <FavoritesProvider>
            <CartProvider>
              <App />
              <Toaster
                position="top-right"
                richColors
                closeButton
                theme="dark"
                toastOptions={{
                  style: {
                    background: "rgba(20, 20, 20, 0.95)",
                    border: "1px solid rgba(255, 255, 255, 0.1)",
                    color: "#fff",
                  },
                }}
              />
            </CartProvider>
            </FavoritesProvider>
          </AuthProvider>
        </BrowserRouter>
      </GoogleOAuthProvider>
    </ErrorBoundary>
    </HelmetProvider>
  </StrictMode>
);
