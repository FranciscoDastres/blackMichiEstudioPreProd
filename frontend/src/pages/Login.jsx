// Login.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { GoogleLogin } from "@react-oauth/google";
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  LogIn,
  ArrowLeft,
  Sparkles
} from "lucide-react";

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
      if (res.user?.rol === "admin") {
        navigate("/admin");
      } else {
        navigate("/cuenta/perfil");
      }
    } else {
      setMessage(res.error || "Error al iniciar sesión con Google");
    }
    setSubmitting(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    let newErrors = {};
    if (!formData.email) newErrors.email = "El correo es obligatorio";
    if (!formData.password) newErrors.password = "La contraseña es obligatoria";
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) {
      setMessage("");
      return;
    }
    setSubmitting(true);
    setMessage("");
    try {
      const res = await login(formData.email, formData.password);
      if (res.success) {
        const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
        if (storedUser?.rol === "admin") {
          navigate("/admin");
        } else {
          navigate("/cuenta/perfil");
        }
      } else {
        setMessage(res.error || "Credenciales inválidas o error de servidor");
      }
    } catch (err) {
      setMessage("Error inesperado de servidor");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 pattern-bg">
      {/* Luces de fondo */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary/8 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-md mx-auto">
        {/* Botón de retroceso */}
        <button
          onClick={() => navigate("/")}
          className="absolute -top-14 left-0 flex items-center gap-2 text-muted hover:text-primary transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span className="text-sm">Volver a la tienda</span>
        </button>

        {/* Card principal */}
        <div className="glass-panel rounded-2xl border border-border/50 shadow-2xl overflow-hidden">

          {/* Header */}
          <div className="px-8 pt-8 pb-6 border-b border-border/30">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <p className="text-xs text-muted uppercase tracking-widest font-semibold">Black Michi Estudio</p>
                <p className="text-xs text-muted/60">Impresiones 3D Personalizadas</p>
              </div>
            </div>
            <h1 className="text-2xl font-display font-extrabold text-foreground">
              Iniciar Sesión
            </h1>
            <p className="text-sm text-muted mt-1 normal-case font-normal tracking-normal">
              Accede a tu cuenta para continuar
            </p>
          </div>

          <div className="px-8 py-6 space-y-5">
            {/* Mensaje de error */}
            {message && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-400 text-sm">
                {message}
              </div>
            )}

            {/* Bloque Google */}
            <div className="rounded-xl border border-border/50 bg-secondary/30 p-4 flex flex-col items-center gap-3">
              <p className="text-xs text-muted/70 uppercase tracking-wider font-semibold">Acceso rápido</p>
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={() => setMessage("No se pudo conectar con Google")}
                text="continue_with"
                theme="filled_black"
                size="large"
                shape="rectangular"
                locale="es_419"
                width="340"
              />
            </div>

            {/* Separador */}
            <div className="flex items-center gap-3">
              <div className="flex-grow h-px bg-border/40" />
              <span className="text-xs text-muted/50 uppercase tracking-wider">o con email</span>
              <div className="flex-grow h-px bg-border/40" />
            </div>

            {/* Formulario */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email */}
              <div className="space-y-1.5">
                <label htmlFor="email" className="text-xs font-semibold text-muted/80 uppercase tracking-wider flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5" />
                  Correo electrónico
                </label>
                <div className="relative">
                  <input
                    type="email"
                    name="email"
                    id="email"
                    autoComplete="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="tucorreo@ejemplo.com"
                    className={`w-full pl-10 pr-4 py-2.5 rounded-xl border bg-secondary/40 ${
                      errors.email ? "border-rose-500/50" : "border-border/60"
                    } text-foreground text-sm placeholder:text-muted/30 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/50 transition-all`}
                    disabled={submitting}
                  />
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted/40" />
                </div>
                {errors.email && <p className="text-rose-400 text-xs">{errors.email}</p>}
              </div>

              {/* Contraseña */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label htmlFor="password" className="text-xs font-semibold text-muted/80 uppercase tracking-wider flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5" />
                    Contraseña
                  </label>
                  <button
                    type="button"
                    className="text-xs text-primary/80 hover:text-primary transition-colors normal-case font-normal tracking-normal"
                    onClick={() => navigate("/forgot-password")}
                  >
                    ¿Olvidaste tu contraseña?
                  </button>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    id="password"
                    autoComplete="current-password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="••••••••"
                    className={`w-full pl-10 pr-10 py-2.5 rounded-xl border bg-secondary/40 ${
                      errors.password ? "border-rose-500/50" : "border-border/60"
                    } text-foreground text-sm placeholder:text-muted/30 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/50 transition-all`}
                    disabled={submitting}
                  />
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted/40" />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted/40 hover:text-muted transition-colors"
                    disabled={submitting}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.password && <p className="text-rose-400 text-xs">{errors.password}</p>}
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={submitting}
                className="btn-add-cart w-full !py-3 !rounded-xl !text-sm group"
              >
                {submitting ? (
                  <>
                    <div className="w-4 h-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    Ingresando...
                  </>
                ) : (
                  <>
                    <LogIn className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                    Iniciar sesión
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Footer de la card */}
          <div className="px-8 py-5 border-t border-border/30 bg-secondary/20 text-center">
            <p className="text-sm text-muted normal-case font-normal tracking-normal">
              ¿No tienes una cuenta?{" "}
              <button
                type="button"
                onClick={() => navigate("/register")}
                className="text-primary hover:text-primary/70 font-semibold transition-colors"
              >
                Regístrate gratis
              </button>
            </p>
          </div>
        </div>

        {/* Términos */}
        <p className="mt-5 text-center text-xs text-muted/40 normal-case font-normal tracking-normal">
          Al continuar, aceptas los{" "}
          <button className="hover:text-primary transition-colors underline underline-offset-2">
            Términos de servicio
          </button>{" "}
          y la{" "}
          <button className="hover:text-primary transition-colors underline underline-offset-2">
            Política de privacidad
          </button>
        </p>
      </div>
    </div>
  );
}
