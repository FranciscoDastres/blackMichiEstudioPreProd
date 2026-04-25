import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../services/api";
import { Eye, EyeOff, CheckCircle, AlertCircle, ArrowLeft } from "lucide-react";

export default function ResetPassword() {
  const [token, setToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // Supabase envía el token en el hash de la URL: #access_token=xxx&type=recovery
  useEffect(() => {
    const hash = window.location.hash;
    const params = new URLSearchParams(hash.replace("#", ""));
    const accessToken = params.get("access_token");
    const type = params.get("type");

    if (accessToken && type === "recovery") {
      setToken(accessToken);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    if (newPassword.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Las contraseñas no coinciden");
      return;
    }
    if (!token) {
      setError("El enlace es inválido o ya expiró. Solicita uno nuevo.");
      return;
    }

    setLoading(true);
    try {
      await api.post("/auth/reset-password", { token, newPassword });
      setSuccess(true);
      setTimeout(() => navigate("/login"), 3000);
    } catch (err: any) {
      setError(err.response?.data?.error || "Error al restablecer la contraseña. El enlace puede haber expirado.");
    } finally {
      setLoading(false);
    }
  };

  // Si no hay token en la URL, mostrar error
  if (!token && !window.location.hash.includes("access_token")) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="w-full max-w-md text-center space-y-4">
          <AlertCircle className="w-14 h-14 text-rose-500 mx-auto" />
          <h1 className="text-xl font-bold text-foreground">Enlace inválido</h1>
          <p className="text-sm text-muted">Este enlace no es válido o ya expiró.</p>
          <Link
            to="/forgot-password"
            className="inline-flex items-center gap-2 text-sm text-primary hover:text-primary/70 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Solicitar un nuevo enlace
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">

        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-foreground">Nueva contraseña</h1>
          <p className="text-sm text-muted mt-1">Elige una contraseña segura para tu cuenta</p>
        </div>

        <div className="bg-background border border-border rounded-2xl shadow-lg p-8">
          {success ? (
            <div className="text-center space-y-4">
              <CheckCircle className="w-14 h-14 text-green-500 mx-auto" />
              <p className="text-foreground font-medium">¡Contraseña actualizada!</p>
              <p className="text-sm text-muted">Serás redirigido al inicio de sesión en unos segundos.</p>
              <Link to="/login" className="inline-flex items-center gap-2 text-sm text-primary hover:text-primary/70 transition-colors">
                <ArrowLeft className="w-4 h-4" />
                Ir al inicio de sesión
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
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  Nueva contraseña
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Mínimo 6 caracteres"
                    disabled={loading}
                    autoFocus
                    className="w-full px-4 py-2.5 pr-10 rounded-lg border border-border bg-secondary/30 text-foreground text-sm placeholder:text-muted/40 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/50 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted/50 hover:text-muted transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  Confirmar contraseña
                </label>
                <input
                  type={showPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repite la contraseña"
                  disabled={loading}
                  className="w-full px-4 py-2.5 rounded-lg border border-border bg-secondary/30 text-foreground text-sm placeholder:text-muted/40 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/50 transition-all"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 rounded-lg bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
              >
                {loading ? (
                  <div className="w-4 h-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                ) : "Guardar nueva contraseña"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
