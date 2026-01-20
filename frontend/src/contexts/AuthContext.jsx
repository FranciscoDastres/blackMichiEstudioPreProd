import { createContext, useContext, useEffect, useState } from "react";
// Importamos ApiService para centralizar las llamadas y no duplicar lógica de axios
import ApiService from "../services/api";

const AuthContext = createContext(null);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return context;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Cargar sesión desde localStorage al iniciar la app
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const token = localStorage.getItem("token");

    if (storedUser && token) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  // LOGIN
  const login = async (email, password) => {
    try {
      // IMPORTANTE: Usamos ApiService.login para mantener consistencia con las rutas /api/
      const data = await ApiService.login({ email, password });

      const { token, user: userData } = data;

      // Guardamos credenciales
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(userData));

      setUser(userData);

      // RETORNO: Agregamos 'user' para que el Login.jsx pueda leer res.user.rol
      return { success: true, user: userData };
    } catch (error) {
      console.error("Error en login context:", error);
      return {
        success: false,
        error: error.response?.data?.error || "Credenciales inválidas o error de conexión",
      };
    }
  };

  // REGISTER
  const register = async (nombre, email, password) => {
    try {
      // Asumiendo que añades register a ApiService o usas la ruta correcta aquí
      const { data } = await ApiService.api.post("/api/auth/register", {
        nombre,
        email,
        password,
      });

      const { token, user: userData } = data;

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(userData));
      setUser(userData);

      return { success: true, user: userData };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || "Error al registrarse",
      };
    }
  };

  // LOGOUT
  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    window.location.href = "/login"; // Redirección limpia
  };

  const value = {
    user,
    loading,
    isAuthenticated: !!user,
    isAdmin: user?.rol === "admin",
    isClient: user?.rol === "cliente",
    login,
    register,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}