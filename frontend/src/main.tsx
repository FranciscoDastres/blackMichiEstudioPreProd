// frontend/src/main.tsx
import React, { StrictMode } from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { Toaster } from "sonner";
import App from "./App";
import { CartProvider } from "./contexts/CartContext";
import { AuthProvider } from "./contexts/AuthContext";
import { FavoritesProvider } from "./contexts/FavoritesContext";
import ErrorBoundary from "./components/ErrorBoundary/ErrorBoundary";
import { initHoverImageLoading, initIntersectionObserver } from "./utils/lazyImageLoader";
import { initAnalytics, initClarity, reportWebVitals } from "./utils/analytics";
import "./index.css";

function initSentryWhenIdle(): void {
  const dsn = import.meta.env.VITE_SENTRY_DSN as string | undefined;
  if (!dsn || typeof window === "undefined") return;

  const loadSentry = () => {
    import("@sentry/react").then((Sentry) => {
      Sentry.init({
        dsn,
        environment: import.meta.env.MODE,
        integrations: [Sentry.browserTracingIntegration()],
        tracesSampleRate: Number(import.meta.env.VITE_SENTRY_TRACES_SAMPLE_RATE ?? 0.1),
      });
    });
  };

  const schedule = window.requestIdleCallback || ((callback) => window.setTimeout(callback, 1500));
  if (document.readyState === "complete") {
    schedule(loadSentry);
  } else {
    window.addEventListener("load", () => schedule(loadSentry), { once: true });
  }
}

initSentryWhenIdle();
initClarity();
initAnalytics();
reportWebVitals();

if (typeof window !== "undefined") {
  window.addEventListener("load", () => {
    initHoverImageLoading();
    initIntersectionObserver();
  });
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <HelmetProvider>
    <ErrorBoundary>
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
    </ErrorBoundary>
    </HelmetProvider>
  </StrictMode>
);
