"use client";
//header.jsx
import { useState, useEffect } from "react";
import { Menu, X, ShoppingCart, ChevronDown, User, Settings, LogOut, Trash2, Plus, Minus } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import api from "../../services/api";
import useCart from "../../hooks/useCart";
import { useAuth } from "../../contexts/AuthContext";

function capitalize(word) {
  if (!word) return '';
  return word.charAt(0).toUpperCase() + word.slice(1);
}

function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const { cart, cartCount, cartTotal, removeFromCart, updateQuantity, clearCart } = useCart();
  const [cartSidebarOpen, setCartSidebarOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const navigate = useNavigate();
  const { user, logout, isAdmin, isClient } = useAuth();
  const CLP = new Intl.NumberFormat("es-CL", { style: "currency", currency: "CLP", maximumFractionDigits: 0 });

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await api.get("/categorias");
        // ✅ Validar que sea un array
        const data = Array.isArray(response.data) ? response.data : [];
        setCategories(data);
      } catch (err) {
        console.error("❌ Error cargando categorías:", err);
        setError("Error al cargar categorías");
        // ✅ Fallback con categorías por defecto
        setCategories([
          { id: 1, nombre: "Vasos 3D", descripcion: "Vasos personalizados en 3D" },
          { id: 2, nombre: "Placas Navi", descripcion: "Placas decorativas Navi" },
          { id: 3, nombre: "Figuras", descripcion: "Figuras coleccionables 3D" },
        ]);
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuOpen && !event.target.closest(".user-menu")) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [userMenuOpen]);

  useEffect(() => {
    const handleStorageChange = () => {
      console.log('🔄 Storage cambió - actualizando header');
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('cart-cleared', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('cart-cleared', handleStorageChange);
    };
  }, []);

  // ✅ Función para navegar a categoría
  const handleCategoryClick = (categoryId, categoryName) => {
    // ✅ OPCIÓN 1: Si tu backend soporta buscar por ID
    // navigate(`/productos?categoria=${categoryId}`);

    // ✅ OPCIÓN 2: Si necesita buscar por nombre (URL encoded)
    navigate(`/productos?categoria=${encodeURIComponent(categoryName)}`);
    setSidebarOpen(false);
  };

  // ✅ Función para ir a todos los productos
  const handleAllProducts = () => {
    navigate('/productos');
    setSidebarOpen(false);
  };

  return (
    <div className="sticky top-0 z-50 bg-background bg-grid shadow-lg border-b border-border w-full">

      {/* HEADER DESKTOP */}
      <header className="border-b border-border w-full hidden md:block">
        <div className="w-full max-w-none mx-auto px-4 lg:px-20 xl:px-32">
          <div className="flex items-center justify-between py-0 sm:py-5">
            <a href="/" className="flex items-center space-x-3 hover:opacity-80 transition-opacity duration-200">
              <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-primary-foreground" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
                </svg>
              </div>
              <div>
                <div className="font-bold text-xl xl:text-2xl text-foreground">Black Michi Studio</div>
                <div className="text-sm xl:text-base text-muted">Impresiones 3D Personalizadas</div>
              </div>
            </a>

            <div className="flex items-center space-x-4 xl:space-x-8">
              {user ? (
                <>
                  <div className="relative user-menu">
                    <button
                      onClick={() => setUserMenuOpen(!userMenuOpen)}
                      className="flex items-center space-x-2 text-foreground hover:text-primary transition-colors"
                    >
                      <User className="w-5 h-5" />
                      <span className="font-medium">{user.nombre}</span>
                      <ChevronDown className="w-4 h-4" />
                    </button>
                    {userMenuOpen && (
                      <div className="absolute right-0 mt-2 w-48 bg-background rounded-md shadow-lg py-1 z-50 border border-border">
                        {isAdmin && (
                          <Link
                            to="/admin"
                            className="block px-4 py-2 text-sm text-foreground hover:bg-muted/20 flex items-center space-x-2"
                            onClick={() => setUserMenuOpen(false)}
                          >
                            <Settings className="w-4 h-4" />
                            <span>Panel Admin</span>
                          </Link>
                        )}
                        {isClient && (
                          <Link
                            to="/client"
                            className="block px-4 py-2 text-sm text-foreground hover:bg-muted/20 flex items-center space-x-2"
                            onClick={() => setUserMenuOpen(false)}
                          >
                            <User className="w-4 h-4" />
                            <span>Mi Panel</span>
                          </Link>
                        )}
                        <button
                          onClick={() => {
                            logout();
                            setUserMenuOpen(false);
                            navigate("/");
                          }}
                          className="block w-full text-left px-4 py-2 text-sm text-foreground hover:bg-muted/20 flex items-center space-x-2"
                        >
                          <LogOut className="w-4 h-4" />
                          <span>Cerrar Sesión</span>
                        </button>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <>
                  <Link to="/login" className="text-foreground hover:text-primary font-medium">Iniciar Sesión</Link>
                  <span className="text-muted font-light">|</span>
                  <Link to="/register" className="text-foreground hover:text-primary font-medium">Registro</Link>
                </>
              )}
              <button className="p-2 hover:text-primary transition-colors relative" onClick={() => setCartSidebarOpen(true)}>
                <ShoppingCart className="w-6 h-6" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                    {cartCount}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* NAV CATEGORÍAS */}
        <div className="w-full h-[1px] bg-border mb-0 mt-1" />
        <nav className="border-b border-border bg-background w-full overflow-x-auto scrollbar-hide">
          <div className="px-4 lg:px-20 xl:px-32 mx-auto w-full max-w-none">
            <div className="flex items-center justify-between py-4">
              <div className="flex items-center space-x-6 xl:space-x-10">
                <div className="relative">
                  <button
                    onClick={() => setSidebarOpen(true)}
                    className="flex items-center space-x-2 transition-colors duration-200 font-semibold text-foreground"
                  >
                    <Menu className="w-5 h-5" />
                    <span>COMPRAR POR CATEGORÍA</span>
                    <ChevronDown className={`w-5 h-5 transition-transform duration-200 ${sidebarOpen ? "rotate-180" : ""}`} />
                  </button>

                  {/* OVERLAY CATEGORÍAS */}
                  {sidebarOpen && (
                    <div
                      className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity duration-300"
                      onClick={() => setSidebarOpen(false)}
                    />
                  )}

                  {/* SIDEBAR CATEGORÍAS */}
                  <div
                    className={`fixed top-0 left-0 h-full w-80 bg-background shadow-2xl z-50 flex flex-col transform transition-transform duration-300 ease-in-out ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}
                  >
                    <div className="flex items-center justify-between px-6 py-4 border-b border-border">
                      <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                          <svg className="w-5 h-5 text-primary-foreground" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
                          </svg>
                        </div>
                        <div>
                          <div className="font-bold text-lg text-foreground">blackmichiestudio</div>
                          <div className="text-xs text-muted">Impresiones 3D Personalizadas</div>
                        </div>
                      </div>
                      <button onClick={() => setSidebarOpen(false)}>
                        <X className="w-6 h-6 text-muted" />
                      </button>
                    </div>

                    <div className="flex-1 overflow-y-auto px-6 py-4">
                      <ul className="space-y-2">
                        {/* ✅ NUEVO: Botón "Todos los Productos" */}
                        <li>
                          <button
                            onClick={handleAllProducts}
                            className="w-full text-left text-foreground hover:text-primary text-base font-bold py-3 px-2 rounded transition bg-primary/10 border-2 border-primary mb-4"
                          >
                            🛍️ Todos los Productos
                          </button>
                        </li>

                        {/* ✅ Mapear categorías */}
                        {categories.map((cat) => (
                          <li key={cat.id}>
                            <button
                              onClick={() => handleCategoryClick(cat.id, cat.nombre)}
                              className="w-full text-left text-foreground hover:text-primary text-base font-medium py-2 px-2 rounded transition capitalize"
                            >
                              {capitalize(cat.nombre)}
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="flex space-x-4 xl:space-x-6 overflow-x-auto scrollbar-hide">
                  {categories.map((category) => (
                    <button
                      key={category.id}
                      onClick={() => handleCategoryClick(category.id, category.nombre)}
                      className="text-foreground transition-colors duration-200 whitespace-nowrap font-semibold relative capitalize group px-3 py-1.5 rounded-lg hover:text-primary active:outline-none focus:outline-none overflow-hidden"
                    >
                      <span className="relative z-10">{capitalize(category.nombre)}</span>
                      <span className="pointer-events-none absolute left-1/2 top-1/2 w-0 h-0 rounded-full bg-primary/30 opacity-0 group-active:opacity-100 group-active:w-[220%] group-active:h-[400%] group-active:transition-all group-active:duration-400 transform -translate-x-1/2 -translate-y-1/2 transition-all duration-300"></span>
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex items-center space-x-3 text-base text-muted">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
                <span>Envío Gratis en Compras Mayores a $20.000</span>
              </div>
            </div>
          </div>
        </nav>
      </header>

      {/* OVERLAY CARRITO */}
      {cartSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity duration-300"
          onClick={() => setCartSidebarOpen(false)}
        />
      )}

      {/* SIDEBAR CARRITO */}
      <div
        className={`fixed top-0 right-0 h-full w-96 bg-background shadow-2xl z-50 flex flex-col transform transition-transform duration-300 ease-in-out ${cartSidebarOpen ? "translate-x-0" : "translate-x-full"}`}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <div className="flex items-center space-x-2">
            <ShoppingCart className="w-6 h-6 text-primary" />
            <span className="font-bold text-lg text-foreground">Carrito de compras</span>
          </div>
          <button onClick={() => setCartSidebarOpen(false)}>
            <X className="w-6 h-6 text-muted" />
          </button>
        </div>

        {cart.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
            <ShoppingCart className="w-16 h-16 text-muted opacity-30 mb-4" />
            <p className="text-muted mb-2">Tu carrito está vacío</p>
            <button
              onClick={() => {
                setCartSidebarOpen(false);
                navigate('/');
              }}
              className="text-primary hover:opacity-80 font-medium"
            >
              Ver productos
            </button>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto px-6 py-4">
              <div className="space-y-4">
                {cart.map((item) => (
                  <div key={item.id} className="flex gap-4 border-b border-border pb-4">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-foreground text-sm mb-1">
                        {item.titulo}
                      </h3>
                      <p className="text-primary font-semibold text-sm mb-2">
                        {CLP.format(item.precio)}
                      </p>

                      <div className="flex items-center gap-2">
                        <div className="flex items-center border border-border rounded">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="p-1 hover:bg-muted/20 transition-colors"
                            disabled={item.quantity <= 1}
                          >
                            <Minus className="w-4 h-4 text-muted" />
                          </button>
                          <span className="px-3 text-sm font-medium">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="p-1 hover:bg-muted/20 transition-colors"
                            disabled={item.stock && item.quantity >= item.stock}
                          >
                            <Plus className="w-4 h-4 text-muted" />
                          </button>
                        </div>

                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="p-1 hover:bg-red-50 rounded transition-colors"
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </button>
                      </div>
                    </div>

                    <div className="text-right">
                      <p className="font-semibold text-foreground text-sm">
                        {CLP.format(item.precio * item.quantity)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="border-t border-border px-6 py-4">
              <div className="flex justify-between font-semibold text-foreground mb-2">
                <span>Total:</span>
                <span>{CLP.format(cartTotal)}</span>
              </div>
              <button
                className="w-full bg-primary text-primary-foreground py-2 rounded hover:bg-primary/90 transition mb-2"
                onClick={() => { setCartSidebarOpen(false); navigate('/checkout'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
              >
                Ir a pagar
              </button>
              <button className="w-full text-xs text-muted underline" onClick={clearCart}>
                Vaciar carrito
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default Header;
