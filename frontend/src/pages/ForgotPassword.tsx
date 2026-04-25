import { useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import { Mail, ArrowLeft, CheckCircle } from "lucide-react";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!email.trim()) {
      setError("El correo es obligatorio");
      return;
    }
    setLoading(true);
    setError("");
    try {
      await api.post("/auth/forgot-password", { email: email.trim() });
      setSubmitted(true);
    } catch {
      setError("Ocurrió un error. Intenta nuevamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">

        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-foreground">Recuperar contraseña</h1>
          <p className="text-sm text-muted mt-1">
            {submitted ? "Revisa tu bandeja de entrada" : "Te enviaremos un enlace para restablecer tu contraseña"}
          </p>
        </div>

        <div className="bg-background border border-border rounded-2xl shadow-lg p-8">
          {submitted ? (
            <div className="text-center space-y-4">
              <div className="flex justify-center">
                <CheckCircle className="w-14 h-14 text-green-500" />
              </div>
              <p className="text-foreground font-medium">¡Correo enviado!</p>
              <p className="text-sm text-muted">
                Si <span className="text-foreground font-medium">{email}</span> está registrado,
                recibirás un enlace para restablecer tu contraseña en los próximos minutos.
              </p>
              <p className="text-xs text-muted">Revisa también tu carpeta de spam.</p>
              <Link
                to="/login"
                className="inline-flex items-center gap-2 text-sm text-primary hover:text-primary/70 transition-colors mt-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Volver al inicio de sesión
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-lg text-rose-400 text-sm">
                  {error}
                </div>
              )}

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-foreground mb-1.5">
                  Correo electrónico
                </label>
                <div className="relative">
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="tucorreo@ejemplo.com"
                    disabled={loading}
                    autoFocus
                    className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-border bg-secondary/30 text-foreground text-sm placeholder:text-muted/40 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/50 transition-all"
                  />
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted/50" />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 rounded-lg bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
              >
                {loading ? (
                  <div className="w-4 h-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                ) : "Enviar enlace"}
              </button>

              <Link
                to="/login"
                className="flex items-center justify-center gap-2 text-sm text-muted hover:text-foreground transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Volver al inicio de sesión
              </Link>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
