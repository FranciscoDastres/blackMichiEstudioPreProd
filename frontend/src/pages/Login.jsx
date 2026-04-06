import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { GoogleLogin } from "@react-oauth/google";
import { Eye, EyeOff } from "lucide-react";

export default function Login() {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();
  const { login, loginWithGoogle } = useAuth();

  const handleGoogleSuccess = async (credentialResponse) => {
    setSubmitting(true);
    setMessage("");
    const res = await loginWithGoogle(credentialResponse.credential);
    if (res.success) {
      navigate(res.user?.rol === "admin" ? "/admin" : "/cuenta/perfil");
    } else {
      setMessage(res.error || "Error al iniciar sesión con Google");
    }
    setSubmitting(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};
    if (!formData.email) newErrors.email = "El correo es obligatorio";
    if (!formData.password) newErrors.password = "La contraseña es obligatoria";
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    setSubmitting(true);
    setMessage("");
    try {
      const res = await login(formData.email, formData.password);
      if (res.success) {
        const stored = JSON.parse(localStorage.getItem("user") || "{}");
        navigate(stored?.rol === "admin" ? "/admin" : "/cuenta/perfil");
      } else {
        setMessage(res.error || "Credenciales inválidas");
      }
    } catch {
      setMessage("Error inesperado de servidor");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">

        {/* Logo / título */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-foreground">Black Michi Estudio</h1>
          <p className="text-sm text-muted mt-1">Inicia sesión en tu cuenta</p>
        </div>

        {/* Card */}
        <div className="bg-background border border-border rounded-2xl shadow-lg p-8 space-y-5">

          {message && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-lg text-rose-400 text-sm">
              {message}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-foreground mb-1.5">
                Correo electrónico
              </label>
              <input
                type="email"
                id="email"
                autoComplete="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="tucorreo@ejemplo.com"
                disabled={submitting}
                className={`w-full px-4 py-2.5 rounded-lg border ${
                  errors.email ? "border-rose-500/60" : "border-border"
                } bg-secondary/30 text-foreground text-sm placeholder:text-muted/40 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/50 transition-all`}
              />
              {errors.email && <p className="text-rose-400 text-xs mt-1">{errors.email}</p>}
            </div>

            {/* Contraseña */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="password" className="text-sm font-medium text-foreground">
                  Contraseña
                </label>
                <button
                  type="button"
                  onClick={() => navigate("/forgot-password")}
                  className="text-xs text-primary hover:text-primary/70 transition-colors"
                >
                  ¿Olvidaste tu contraseña?
                </button>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  autoComplete="current-password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="••••••••"
                  disabled={submitting}
                  className={`w-full px-4 py-2.5 pr-10 rounded-lg border ${
                    errors.password ? "border-rose-500/60" : "border-border"
                  } bg-secondary/30 text-foreground text-sm placeholder:text-muted/40 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/50 transition-all`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted/50 hover:text-muted transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && <p className="text-rose-400 text-xs mt-1">{errors.password}</p>}
            </div>

            {/* Botón login */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-2.5 rounded-lg bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
            >
              {submitting ? (
                <div className="w-4 h-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
              ) : "Iniciar sesión"}
            </button>
          </form>

          {/* Separador */}
          <div className="flex items-center gap-3">
            <div className="flex-grow h-px bg-border" />
            <span className="text-xs text-muted">O continuar con</span>
            <div className="flex-grow h-px bg-border" />
          </div>

          {/* Google */}
          <div className="flex justify-center">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => setMessage("No se pudo conectar con Google")}
              text="continue_with"
              theme="filled_black"
              size="large"
              shape="rectangular"
              locale="es_419"
              width="320"
            />
          </div>

          {/* Link registro */}
          <p className="text-center text-sm text-muted">
            ¿No tienes cuenta?{" "}
            <button
              type="button"
              onClick={() => navigate("/register")}
              className="text-primary hover:text-primary/70 font-semibold transition-colors"
            >
              Regístrate
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
