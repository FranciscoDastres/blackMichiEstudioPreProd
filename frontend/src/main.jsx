import React, { StrictMode } from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import { CartProvider } from "./contexts/CartContext";
import { AuthProvider } from "./contexts/AuthContext";
import { initHoverImageLoading, initIntersectionObserver } from "./utils/lazyImageLoader";
import "./index.css";

initHoverImageLoading();
initIntersectionObserver();

// 🔍 ATRAPAR ERROR #306 EN PRODUCCIÓN
window.onerror = (msg, src, line, col, err) => {
  document.body.innerHTML = `<pre style="color:red;padding:20px;background:#111;color:#fff;font-size:12px">
ERROR: ${msg}
FILE: ${src}
LINE: ${line}
STACK: ${err?.stack}
  </pre>`;
};

ReactDOM.createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <AuthProvider>
        <CartProvider>
          <App />
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>
);