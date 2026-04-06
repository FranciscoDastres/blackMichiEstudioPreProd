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
    <div className="min-h-screen bg-background flex items-center justify-center p-2" style={{
      backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255, 255, 255, 0.04) 1px, transparent 0)',
      backgroundSize: '32px 32px'
    }}>
      {/* Elementos decorativos de fondo */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/5 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-primary/5 rounded-full blur-3xl"></div>
      </div>

      <div className="relative w-full max-w-md mx-auto">
        {/* Botón de retroceso */}
        <button
          onClick={() => navigate("/")}
          className="absolute -top-16 left-0 flex items-center gap-2 text-muted hover:text-primary transition-colors group"
        >
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          <span>Volver a la tienda</span>
        </button>

        {/* Contenedor del formulario */}
        <div className="glass-panel rounded-2xl overflow-hidden border border-border/50 shadow-2xl p-8 md:p-10">
          {/* Header del formulario */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center">
                <Sparkles className="w-7 h-7 text-primary-foreground" />
              </div>
              <div className="text-left">
                <h1 className="text-3xl font-display font-extrabold text-foreground">
                  Black Michi Estudio
                </h1>
                <p className="text-muted text-sm">Impresiones 3D Personalizadas</p>
              </div>
            </div>

            <div className="text-left">
              <h2 className="text-2xl font-display font-extrabold text-foreground mb-3">
                Iniciar Sesión
              </h2>
              <p className="text-muted">
                Ingresa tus credenciales para acceder a tu cuenta
              </p>
            </div>
          </div>

          {/* Mensaje de error */}
          {message && (
            <div className="mb-6 p-4 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-400 text-sm">
              {message}
            </div>
          )}

          {/* Formulario */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email */}
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium text-muted flex items-center gap-2">
                <Mail className="w-4 h-4" />
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
                  className={`glass-panel w-full pl-12 pr-4 py-3 rounded-xl border ${errors.email ? 'border-rose-500/50' : 'border-border'
                    } text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all duration-300`}
                  aria-label="Correo electrónico"
                  disabled={submitting}
                />
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted" />
              </div>
              {errors.email && (
                <p className="text-rose-400 text-sm">{errors.email}</p>
              )}
            </div>

            {/* Contraseña */}
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium text-muted flex items-center gap-2">
                <Lock className="w-4 h-4" />
                Contraseña
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  id="password"
                  autoComplete="current-password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="••••••••"
                  className={`glass-panel w-full pl-12 pr-12 py-3 rounded-xl border ${errors.password ? 'border-rose-500/50' : 'border-border'
                    } text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all duration-300`}
                  aria-label="Contraseña"
                  disabled={submitting}
                />
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted hover:text-foreground transition-colors"
                  aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                  disabled={submitting}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-rose-400 text-sm">{errors.password}</p>
              )}
            </div>

            {/* Recordar contraseña y olvidé contraseña */}
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="remember"
                  className="w-4 h-4 rounded border-border bg-secondary text-primary focus:ring-primary focus:ring-offset-0 focus:ring-2"
                />
                <label htmlFor="remember" className="ml-2 text-sm text-muted">
                  Recordarme
                </label>
              </div>
              <button
                type="button"
                className="text-sm text-primary hover:text-primary/80 transition-colors"
                onClick={() => navigate('/forgot-password')}
              >
                ¿Olvidaste tu contraseña?
              </button>
            </div>

            {/* Botón de inicio de sesión */}
            <button
              type="submit"
              disabled={submitting}
              className="btn-add-cart w-full !px-6 !py-4 !rounded-xl !text-lg group relative overflow-hidden"
            >
              <div className="flex items-center justify-center gap-3">
                {submitting ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-current border-t-transparent"></div>
                    Ingresando...
                  </>
                ) : (
                  <>
                    <LogIn className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    Iniciar sesión
                  </>
                )}
              </div>
            </button>
          </form>

          {/* Separador */}
          <div className="flex items-center my-8">
            <div className="flex-grow h-px bg-border/50" />
            <span className="mx-4 text-muted text-sm">o inicia con</span>
            <div className="flex-grow h-px bg-border/50" />
          </div>

          {/* Botón de Google */}
          <div className="flex justify-center">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => setMessage("No se pudo conectar con Google")}
              text="continue_with"
              theme="filled_black"
              size="large"
              shape="rectangular"
              locale="es_419"
              width="368"
            />
          </div>

          {/* Enlace a registro */}
          <div className="mt-8 pt-6 border-t border-border/50">
            <p className="text-center text-muted">
              ¿No tienes una cuenta?{" "}
              <button
                type="button"
                onClick={() => navigate('/register')}
                className="text-primary hover:text-primary/80 font-semibold transition-colors"
              >
                Regístrate aquí
              </button>
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 text-center">
          <p className="text-sm text-muted/70">
            Al iniciar sesión, aceptas nuestros{" "}
            <button className="text-primary hover:text-primary/80 transition-colors">
              Términos de servicio
            </button>{" "}
            y{" "}
            <button className="text-primary hover:text-primary/80 transition-colors">
              Política de privacidad
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}