// Register.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { GoogleLogin } from "@react-oauth/google";
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  User,
  UserPlus,
  ArrowLeft,
  Sparkles,
  CheckCircle
} from "lucide-react";

export default function Register() {
  const [formData, setFormData] = useState({
    nombre: "",
    email: "",
    password: ""
  });
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
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

  const validateForm = () => {
    const newErrors = {};

    if (!formData.nombre.trim()) {
      newErrors.nombre = "El nombre es obligatorio";
    } else if (formData.nombre.length < 2) {
      newErrors.nombre = "El nombre debe tener al menos 2 caracteres";
    }

    if (!formData.email) {
      newErrors.email = "El correo es obligatorio";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Correo electrónico inválido";
    }

    if (!formData.password) {
      newErrors.password = "La contraseña es obligatoria";
    } else if (formData.password.length < 6) {
      newErrors.password = "La contraseña debe tener al menos 6 caracteres";
    }

    if (!agreedToTerms) {
      newErrors.terms = "Debes aceptar los términos y condiciones";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setSubmitting(true);
    setMessage("");

    try {
      const res = await register(formData.nombre, formData.email, formData.password);

      if (res.success) {
        setMessage("¡Registro exitoso! Redirigiendo...");
        setTimeout(() => {
          navigate("/");
        }, 2000);
      } else {
        setMessage(res.error || "Error en el registro. Intenta nuevamente.");
      }
    } catch (err) {
      setMessage("Error inesperado del servidor");
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
                Crear nueva cuenta
              </h2>
              <p className="text-muted">
                Únete a nuestra comunidad creativa
              </p>
            </div>
          </div>

          {/* Mensaje de éxito/error */}
          {message && (
            <div className={`mb-6 p-4 rounded-xl text-sm ${message.includes("¡Registro exitoso!")
              ? "bg-emerald-500/10 border border-emerald-500/30 text-emerald-400"
              : "bg-rose-500/10 border border-rose-500/30 text-rose-400"
              }`}>
              <div className="flex items-center gap-2">
                {message.includes("¡Registro exitoso!") && (
                  <CheckCircle className="w-4 h-4" />
                )}
                {message}
              </div>
            </div>
          )}

          {/* Formulario */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Nombre Completo */}
            <div className="space-y-2">
              <label htmlFor="nombre" className="text-sm font-medium text-muted flex items-center gap-2">
                <User className="w-4 h-4" />
                Nombre completo
              </label>
              <div className="relative">
                <input
                  type="text"
                  name="nombre"
                  id="nombre"
                  autoComplete="name"
                  value={formData.nombre}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                  placeholder="Tu nombre completo"
                  className={`glass-panel w-full pl-12 pr-4 py-3 rounded-xl border ${errors.nombre ? 'border-rose-500/50' : 'border-border'
                    } text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all duration-300`}
                  aria-label="Nombre completo"
                  disabled={submitting}
                />
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted" />
              </div>
              {errors.nombre && (
                <p className="text-rose-400 text-sm">{errors.nombre}</p>
              )}
            </div>

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
                  autoComplete="new-password"
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

            {/* Términos y condiciones */}
            <div className="space-y-2">
              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  id="terms"
                  checked={agreedToTerms}
                  onChange={(e) => setAgreedToTerms(e.target.checked)}
                  className="mt-1 w-4 h-4 rounded border-border bg-secondary text-primary focus:ring-primary focus:ring-offset-0 focus:ring-2"
                  disabled={submitting}
                />
                <label htmlFor="terms" className="text-sm text-muted">
                  Acepto los{" "}
                  <button
                    type="button"
                    className="text-primary hover:text-primary/80 transition-colors"
                    onClick={() => setMessage("Términos y condiciones - Próximamente")}
                  >
                    Términos de servicio
                  </button>{" "}
                  y{" "}
                  <button
                    type="button"
                    className="text-primary hover:text-primary/80 transition-colors"
                    onClick={() => setMessage("Política de privacidad - Próximamente")}
                  >
                    Política de privacidad
                  </button>
                </label>
              </div>
              {errors.terms && (
                <p className="text-rose-400 text-sm">{errors.terms}</p>
              )}
            </div>

            {/* Botón de registro */}
            <button
              type="submit"
              disabled={submitting}
              className="btn-add-cart w-full !px-6 !py-4 !rounded-xl !text-lg group relative overflow-hidden"
            >
              <div className="flex items-center justify-center gap-3">
                {submitting ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-current border-t-transparent"></div>
                    Registrando...
                  </>
                ) : (
                  <>
                    <UserPlus className="w-5 h-5 group-hover:scale-110 transition-transform" />
                    REGISTRARME
                  </>
                )}
              </div>
            </button>
          </form>

          {/* Separador */}
          <div className="flex items-center my-8">
            <div className="flex-grow h-px bg-border/50" />
            <span className="mx-4 text-muted text-sm">O continuar con</span>
            <div className="flex-grow h-px bg-border/50" />
          </div>

          {/* Botón de Google */}
          <div className="flex justify-center mb-6">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => setMessage("No se pudo conectar con Google")}
              text="signup_with"
              theme="filled_black"
              size="large"
              shape="rectangular"
              locale="es_419"
              width="368"
            />
          </div>

          {/* Enlace a login */}
          <div className="pt-6 border-t border-border/50">
            <p className="text-center text-muted">
              ¿Ya tienes una cuenta?{" "}
              <button
                type="button"
                onClick={() => navigate('/login')}
                className="text-primary hover:text-primary/80 font-semibold transition-colors"
              >
                Inicia sesión aquí
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}