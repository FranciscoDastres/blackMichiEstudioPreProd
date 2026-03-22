// frontend/src/main.jsx
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

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null, info: null };
  }
  componentDidCatch(error, info) {
    this.setState({ error, info });
  }
  render() {
    if (this.state.error) {
      return (
        <pre style={{ color: "#fff", background: "#111", padding: "20px", fontSize: "12px", overflow: "auto" }}>
          {`ERROR: ${this.state.error?.message}\n\nCOMPONENT STACK:\n${this.state.info?.componentStack}`}
        </pre>
      );
    }
    return this.props.children;
  }
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <StrictMode>
    <ErrorBoundary>
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <AuthProvider>
          <CartProvider>
            <App />
          </CartProvider>
        </AuthProvider>
      </BrowserRouter>
    </ErrorBoundary>
  </StrictMode>
);