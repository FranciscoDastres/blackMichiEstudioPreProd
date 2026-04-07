// frontend/src/main.jsx
import React, { StrictMode } from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { Toaster } from "sonner";
import App from "./App";
import { CartProvider } from "./contexts/CartContext";
import { AuthProvider } from "./contexts/AuthContext";
import ErrorBoundary from "./components/ErrorBoundary/ErrorBoundary";
import { initHoverImageLoading, initIntersectionObserver } from "./utils/lazyImageLoader";
import "./index.css";

initHoverImageLoading();
initIntersectionObserver();

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

ReactDOM.createRoot(document.getElementById("root")).render(
  <StrictMode>
    <ErrorBoundary>
      <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
        <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <AuthProvider>
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
          </AuthProvider>
        </BrowserRouter>
      </GoogleOAuthProvider>
    </ErrorBoundary>
  </StrictMode>
);
