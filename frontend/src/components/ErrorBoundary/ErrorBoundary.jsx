import React from "react";
import { Link } from "react-router-dom";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    if (import.meta.env.DEV) {
      console.error("[ErrorBoundary]", error, errorInfo);
    }
  }

  handleReload = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="max-w-md w-full text-center glass-panel rounded-2xl p-8 border border-border">
          <div className="text-6xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-primary mb-3">
            Algo salió mal
          </h1>
          <p className="text-muted mb-6">
            Ocurrió un error inesperado. Ya lo estamos revisando.
          </p>
          {import.meta.env.DEV && this.state.error && (
            <pre className="text-left text-xs bg-black/40 text-rose-300 p-3 rounded mb-6 overflow-auto max-h-40">
              {String(this.state.error?.message || this.state.error)}
            </pre>
          )}
          <div className="flex gap-3 justify-center">
            <button
              onClick={this.handleReload}
              className="bg-primary text-primary-foreground px-5 py-2 rounded-lg hover:bg-primary/90 transition"
            >
              Recargar
            </button>
            <Link
              to="/"
              className="border border-border text-foreground px-5 py-2 rounded-lg hover:bg-background/60 transition"
            >
              Ir al inicio
            </Link>
          </div>
        </div>
      </div>
    );
  }
}

export default ErrorBoundary;
