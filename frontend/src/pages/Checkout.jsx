import { useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import useCart from "../hooks/useCart";
import { ShoppingBag, Lock, Truck, CreditCard, User, Mail, Phone, MapPin, FileText, Package, Home } from "lucide-react";

export default function Checkout() {
  const { cart, cartTotal, clearCart } = useCart();
  const [notas, setNotas] = useState("");
  const [email, setEmail] = useState("");
  const [nombre, setNombre] = useState("");
  const [telefono, setTelefono] = useState("+56 ");
  const [direccion, setDireccion] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({
    nombre: "",
    email: "",
    telefono: "",
    direccion: ""
  });

  const CLP = new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    maximumFractionDigits: 0,
  });

  const COSTO_ENVIO = 3500;
  const totalConEnvio = cartTotal + COSTO_ENVIO;

  const validateNombre = (value) => {
    const nombreRegex = /^[A-Za-zÁÉÍÓÚáéíóúñÑ\s]+$/;
    if (!nombreRegex.test(value.trim())) {
      return "El nombre solo debe contener letras y espacios";
    }
    if (value.trim().split(" ").length < 2) {
      return "Ingresa nombre y apellido";
    }
    return "";
  };

  const validateEmail = (value) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value.trim())) {
      return "Ingresa un correo electrónico válido";
    }
    return "";
  };

  const validateTelefono = (value) => {
    if (!value.startsWith("+56 ")) {
      return "El teléfono debe comenzar con +56";
    }
    const cleanNumber = value.replace(/\s/g, "");
    const numberRegex = /^\+569\d{8}$/;
    if (!numberRegex.test(cleanNumber)) {
      return "Ingresa un número chileno válido";
    }
    return "";
  };

  const validateDireccion = (value) => {
    if (value.trim().length < 10) {
      return "La dirección debe ser más específica (mínimo 10 caracteres)";
    }
    return "";
  };

  const handleNombreChange = (e) => {
    const value = e.target.value;
    const filteredValue = value.replace(/[^A-Za-zÁÉÍÓÚáéíóúñÑ\s]/g, '');
    setNombre(filteredValue);
    if (value.trim()) {
      const error = validateNombre(filteredValue);
      setErrors(prev => ({ ...prev, nombre: error }));
    } else {
      setErrors(prev => ({ ...prev, nombre: "" }));
    }
  };

  const handleEmailChange = (e) => {
    const value = e.target.value;
    setEmail(value);
    if (value.trim()) {
      const error = validateEmail(value);
      setErrors(prev => ({ ...prev, email: error }));
    } else {
      setErrors(prev => ({ ...prev, email: "" }));
    }
  };

  const handleTelefonoChange = (e) => {
    let value = e.target.value;
    if (!value.startsWith("+56")) {
      value = "+56 " + value.replace(/^\+56/, '');
    }
    const prefix = "+56 ";
    const rest = value.slice(prefix.length);
    const cleanedRest = rest.replace(/\D/g, '');
    let formatted = prefix;
    if (cleanedRest.length > 0) {
      formatted += cleanedRest.charAt(0);
      if (cleanedRest.length > 1) {
        formatted += ' ' + cleanedRest.slice(1, 5);
      }
      if (cleanedRest.length > 5) {
        formatted += ' ' + cleanedRest.slice(5, 9);
      }
    }
    setTelefono(formatted);
    if (value.trim() !== "+56 ") {
      const error = validateTelefono(formatted);
      setErrors(prev => ({ ...prev, telefono: error }));
    } else {
      setErrors(prev => ({ ...prev, telefono: "" }));
    }
  };

  const handleDireccionChange = (e) => {
    const value = e.target.value;
    setDireccion(value);
    if (value.trim()) {
      const error = validateDireccion(value);
      setErrors(prev => ({ ...prev, direccion: error }));
    } else {
      setErrors(prev => ({ ...prev, direccion: "" }));
    }
  };

  const canProceed = () => {
    return (
      cart.length > 0 &&
      nombre.trim() !== "" &&
      email.trim() !== "" &&
      telefono.trim() !== "+56 " &&
      direccion.trim() !== "" &&
      Object.values(errors).every(error => error === "")
    );
  };

  const handlePayment = async () => {
    const nombreError = validateNombre(nombre);
    const emailError = validateEmail(email);
    const telefonoError = validateTelefono(telefono);
    const direccionError = validateDireccion(direccion);

    const newErrors = {
      nombre: nombreError,
      email: emailError,
      telefono: telefonoError,
      direccion: direccionError
    };

    setErrors(newErrors);

    const firstError = Object.values(newErrors).find(error => error !== "");
    if (firstError) {
      setErrors(prev => ({ ...prev, general: firstError }));
      return;
    }

    if (!canProceed()) {
      setErrors(prev => ({
        ...prev,
        general: "Por favor completa todos los campos requeridos correctamente"
      }));
      return;
    }

    setLoading(true);
    setErrors(prev => ({ ...prev, general: "" }));

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/payments/flow/create`,
        {
          items: cart,
          total: totalConEnvio,
          email: email.trim(),
          nombre: nombre.trim(),
          telefono: telefono.trim(),
          direccion: direccion.trim(),
          notas: notas.trim(),
        }
      );

      if (response.data.success && response.data.paymentUrl) {
        const pendingOrder = {
          pedidoId: response.data.pedidoId,
          email,
          total: totalConEnvio,
          timestamp: Date.now()
        };
        localStorage.setItem('pendingOrder', JSON.stringify(pendingOrder));
        window.location.href = response.data.paymentUrl;
      } else {
        throw new Error("Error al generar el pago");
      }
    } catch (error) {
      let errorMessage = "No se pudo conectar con el sistema de pagos. Intenta nuevamente.";
      if (error.response?.status === 400) {
        if (error.response?.data?.message?.includes("email")) {
          errorMessage = "El correo electrónico no es válido.";
        } else if (error.response?.data?.message?.includes("teléfono") || error.response?.data?.message?.includes("phone")) {
          errorMessage = "El número de teléfono no es válido.";
        } else {
          errorMessage = error.response?.data?.message || "Datos incorrectos.";
        }
      } else if (error.response?.status === 500) {
        errorMessage = "Error en el servidor. Por favor, intenta más tarde.";
      } else if (error.message.includes("Network Error")) {
        errorMessage = "Error de conexión. Verifica tu internet.";
      }
      setErrors(prev => ({ ...prev, general: errorMessage }));
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background py-12 px-4" style={{
      backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255, 255, 255, 0.04) 1px, transparent 0)',
      backgroundSize: '32px 32px'
    }}>
      {/* Elementos decorativos de fondo */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/5 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-primary/5 rounded-full blur-3xl"></div>
      </div>

      <div className="relative max-w-6xl mx-auto">
        {cart.length === 0 ? (
          <div className="glass-panel rounded-2xl p-12 text-center border border-border">
            <ShoppingBag className="w-16 h-16 text-muted mx-auto mb-4" />
            <p className="text-foreground text-lg mb-6">Tu carrito está vacío</p>
            <Link
              to="/"
              className="btn-add-cart inline-block !px-8 !py-3"
            >
              Ver productos
            </Link>
          </div>
        ) : (
          <>
            {/* Header del checkout */}
            <div className="mb-8">
              <div className="inline-flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center">
                  <CreditCard className="w-7 h-7 text-primary-foreground" />
                </div>
                <div>
                  <h1 className="text-3xl font-display font-extrabold text-foreground">
                    Finalizar Compra
                  </h1>
                  <p className="text-muted">Completa tus datos para continuar</p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted">
                <Home className="w-4 h-4" />
                <Link to="/" className="hover:text-primary transition-colors">Inicio</Link>
                <span>›</span>
                <span>Checkout</span>
              </div>
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
              {/* COLUMNA IZQUIERDA - FORMULARIO */}
              <div className="lg:col-span-2 space-y-6">
                {/* Información de contacto */}
                <div className="glass-panel rounded-2xl p-6 border border-border">
                  <h2 className="text-xl font-display font-extrabold text-foreground mb-6 flex items-center gap-3">
                    <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                      <span className="text-primary-foreground font-bold">1</span>
                    </div>
                    Información de Contacto
                  </h2>

                  <div className="space-y-5">
                    {/* Nombre */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-muted flex items-center gap-2">
                        <User className="w-4 h-4" />
                        Nombre completo <span className="text-rose-400">*</span>
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          value={nombre}
                          onChange={handleNombreChange}
                          className={`glass-panel w-full pl-12 pr-4 py-3 rounded-xl border ${errors.nombre ? 'border-rose-500/50' : 'border-border'
                            } text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all duration-300`}
                          placeholder="Juan Pérez González"
                          disabled={loading}
                        />
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted" />
                      </div>
                      {errors.nombre && (
                        <p className="mt-2 text-sm text-rose-400">{errors.nombre}</p>
                      )}
                    </div>

                    {/* Email */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-muted flex items-center gap-2">
                        <Mail className="w-4 h-4" />
                        Correo electrónico <span className="text-rose-400">*</span>
                      </label>
                      <div className="relative">
                        <input
                          type="email"
                          value={email}
                          onChange={handleEmailChange}
                          className={`glass-panel w-full pl-12 pr-4 py-3 rounded-xl border ${errors.email ? 'border-rose-500/50' : 'border-border'
                            } text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all duration-300`}
                          placeholder="tu@email.com"
                          disabled={loading}
                        />
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted" />
                      </div>
                      {errors.email && (
                        <p className="mt-2 text-sm text-rose-400">{errors.email}</p>
                      )}
                    </div>

                    {/* Teléfono */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-muted flex items-center gap-2">
                        <Phone className="w-4 h-4" />
                        Teléfono <span className="text-rose-400">*</span>
                      </label>
                      <div className="relative">
                        <input
                          type="tel"
                          value={telefono}
                          onChange={handleTelefonoChange}
                          className={`glass-panel w-full pl-12 pr-4 py-3 rounded-xl border ${errors.telefono ? 'border-rose-500/50' : 'border-border'
                            } text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all duration-300`}
                          disabled={loading}
                        />
                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted" />
                      </div>
                      {errors.telefono && (
                        <p className="mt-2 text-sm text-rose-400">{errors.telefono}</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Dirección de envío */}
                <div className="glass-panel rounded-2xl p-6 border border-border">
                  <h2 className="text-xl font-display font-extrabold text-foreground mb-6 flex items-center gap-3">
                    <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                      <span className="text-primary-foreground font-bold">2</span>
                    </div>
                    Dirección de Envío
                  </h2>

                  <div className="space-y-5">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-muted flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        Dirección completa <span className="text-rose-400">*</span>
                      </label>
                      <div className="relative">
                        <textarea
                          value={direccion}
                          onChange={handleDireccionChange}
                          className={`glass-panel w-full pl-12 pr-4 py-3 rounded-xl border ${errors.direccion ? 'border-rose-500/50' : 'border-border'
                            } text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all duration-300 resize-none`}
                          rows={3}
                          placeholder="Calle Example 123, Depto 4B, Comuna, Ciudad"
                          disabled={loading}
                        />
                        <MapPin className="absolute left-4 top-4 w-5 h-5 text-muted" />
                      </div>
                      {errors.direccion && (
                        <p className="mt-2 text-sm text-rose-400">{errors.direccion}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-muted flex items-center gap-2">
                        <FileText className="w-4 h-4" />
                        Notas adicionales (opcional)
                      </label>
                      <div className="relative">
                        <textarea
                          value={notas}
                          onChange={(e) => setNotas(e.target.value)}
                          className="glass-panel w-full pl-12 pr-4 py-3 rounded-xl border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all duration-300 resize-none"
                          rows={3}
                          placeholder="Instrucciones especiales, color preferido, etc."
                          disabled={loading}
                        />
                        <FileText className="absolute left-4 top-4 w-5 h-5 text-muted" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* COLUMNA DERECHA - RESUMEN */}
              <div className="lg:col-span-1 space-y-6">
                {/* Resumen de productos */}
                <div className="glass-panel rounded-2xl p-6 border border-border sticky top-6">
                  <h2 className="text-xl font-display font-extrabold text-foreground mb-4">Resumen de Compra</h2>

                  {/* Lista de productos */}
                  <div className="mb-6">
                    <div className="flex items-center gap-2 text-muted text-sm mb-3">
                      <Package className="w-4 h-4" />
                      <span>Productos ({cart.length})</span>
                    </div>
                    <div className="space-y-3 max-h-64 overflow-y-auto pr-2">
                      {cart.map((item) => (
                        <div key={item.id} className="flex gap-3 pb-3 border-b border-border">
                          <div className="flex-1 min-w-0">
                            <h3 className="text-sm font-medium text-foreground mb-1 truncate">{item.titulo}</h3>
                            <p className="text-xs text-muted">
                              {CLP.format(item.precio)} × {item.quantity}
                            </p>
                          </div>
                          <div className="text-sm font-bold text-primary">
                            {CLP.format(item.precio * item.quantity)}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Totales */}
                  <div className="space-y-3 pb-4 border-b border-border mb-4">
                    <div className="flex justify-between text-muted">
                      <span>Subtotal</span>
                      <span>{CLP.format(cartTotal)}</span>
                    </div>
                    <div className="flex justify-between text-muted">
                      <span className="flex items-center gap-2">
                        <Truck className="w-4 h-4" />
                        Envío
                      </span>
                      <span>{CLP.format(COSTO_ENVIO)}</span>
                    </div>
                  </div>

                  {/* Total */}
                  <div className="flex justify-between text-xl font-display font-extrabold text-foreground mb-6">
                    <span>Total</span>
                    <span className="price-text text-2xl">{CLP.format(totalConEnvio)}</span>
                  </div>

                  {/* Mensaje de error general */}
                  {errors.general && (
                    <div className="mb-4 p-3 bg-rose-500/10 border border-rose-500/50 text-rose-400 rounded-lg text-sm">
                      {errors.general}
                    </div>
                  )}

                  {/* Botón de pago */}
                  <button
                    onClick={handlePayment}
                    disabled={!canProceed() || loading}
                    className={`btn-add-cart w-full !px-6 !py-4 !rounded-xl !text-lg group relative overflow-hidden ${!canProceed() || loading ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                  >
                    {loading ? (
                      <span className="flex items-center justify-center gap-3">
                        <div className="animate-spin rounded-full h-5 w-5 border-2 border-current border-t-transparent"></div>
                        Procesando...
                      </span>
                    ) : (
                      <span className="flex items-center justify-center gap-3">
                        <Lock className="w-5 h-5" />
                        Pagar con Flow
                      </span>
                    )}
                  </button>

                  {/* Información adicional */}
                  <div className="mt-4 text-center space-y-3">
                    <div className="flex items-center justify-center gap-2 text-xs text-muted">
                      <Lock className="w-3 h-3" />
                      Pago 100% seguro y encriptado
                    </div>
                    <Link
                      to="/"
                      className="text-sm text-primary hover:text-primary/80 transition-colors inline-flex items-center gap-2"
                    >
                      ← Seguir comprando
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}