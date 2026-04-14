import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { GoogleLogin } from "@react-oauth/google";
import { Eye, EyeOff } from "lucide-react";
import useSEO from "../hooks/useSEO";

export default function Register() {
  const seo = useSEO({ title: "Crear Cuenta", path: "/registro" });

  const [formData, setFormData] = useState({ nombre: "", email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();
  const { register, loginWithGoogle } = useAuth();

  const handleGoogleSuccess = async (credentialResponse) => {
    setSubmitting(true);
    setMessage("");
    const res = await loginWithGoogle(credentialResponse.credential);
    if (res.success) {
      navigate("/cuenta/perfil");
    } else {
      setMessage(res.error || "Error al registrarse con Google");
    }
    setSubmitting(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};
    if (!formData.nombre.trim()) newErrors.nombre = "El nombre es obligatorio";
    if (!formData.email) newErrors.email = "El correo es obligatorio";
    if (!formData.password) newErrors.password = "La contraseña es obligatoria";
    else if (formData.password.length < 6) newErrors.password = "Mínimo 6 caracteres";
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    setSubmitting(true);
    setMessage("");
    try {
      const res = await register(formData.nombre, formData.email, formData.password);
      if (res.success) {
        navigate("/cuenta/perfil");
      } else {
        setMessage(res.error || "Error en el registro");
      }
    } catch {
      setMessage("Error inesperado de servidor");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>{seo}<div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-lg">

        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-foreground">Black Michi Estudio</h1>
          <p className="text-sm text-muted mt-1">Crea tu cuenta</p>
        </div>

        <div className="bg-background border border-border rounded-2xl shadow-lg p-8 space-y-5">

          {message && (
            <div className={`p-3 rounded-lg border text-sm ${
              message.includes("exitoso")
                ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                : "bg-rose-500/10 border-rose-500/30 text-rose-400"
            }`}>
              {message}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="nombre" className="block text-sm font-medium text-foreground mb-1.5">
                Nombre completo
              </label>
              <input
                type="text"
                id="nombre"
                autoComplete="name"
                value={formData.nombre}
                onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                placeholder="Tu nombre"
                disabled={submitting}
                className={`w-full px-4 py-2.5 rounded-lg border ${
                  errors.nombre ? "border-rose-500/60" : "border-border"
                } bg-secondary/30 text-foreground text-sm placeholder:text-muted/40 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/50 transition-all`}
              />
              {errors.nombre && <p className="text-rose-400 text-xs mt-1">{errors.nombre}</p>}
            </div>

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

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-foreground mb-1.5">
                Contraseña
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  autoComplete="new-password"
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

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-2.5 rounded-lg bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
            >
              {submitting ? (
                <div className="w-4 h-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
              ) : "Crear cuenta"}
            </button>
          </form>

          <div className="flex items-center gap-3">
            <div className="flex-grow h-px bg-border" />
            <span className="text-xs text-muted">O continuar con</span>
            <div className="flex-grow h-px bg-border" />
          </div>

          <div className="flex justify-center">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => setMessage("No se pudo conectar con Google")}
              text="signup_with"
              theme="filled_black"
              size="large"
              shape="rectangular"
              locale="es_419"
              width="320"
            />
          </div>

          <p className="text-center text-sm text-muted">
            ¿Ya tienes cuenta?{" "}
            <button
              type="button"
              onClick={() => navigate("/login")}
              className="text-primary hover:text-primary/70 font-semibold transition-colors"
            >
              Inicia sesión
            </button>
          </p>
        </div>
      </div>
    </div></>
  );
}
