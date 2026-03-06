//AuthContext.jsx
import { createContext, useContext, useEffect, useState } from "react";
import api from "../services/api"

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

  // Cargar sesión desde localStorage
  useEffect(() => {
    try {
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        const parsed = JSON.parse(storedUser);
        // ✅ Validar estructura del usuario
        if (parsed && typeof parsed === 'object' && parsed.email) {
          setUser(parsed);
        } else {
          console.warn('⚠️ Datos de usuario inválidos en localStorage');
          localStorage.removeItem("user");
          localStorage.removeItem("token");
        }
      }
    } catch (err) {
      console.error('❌ Error parsing user from localStorage:', err);
      localStorage.removeItem("user");
      localStorage.removeItem("token");
    } finally {
      setLoading(false);
    }
  }, []);

  // LOGIN
  const login = async (email, password) => {
    try {
      const { data } = await api.post("/auth/login", { email, password });
      const { token, user: userData } = data;

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(userData));
      setUser(userData);

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || "Error al iniciar sesión",
      };
    }
  };

  // REGISTER
  const register = async (nombre, email, password) => {
    try {
      const { data } = await api.post("/auth/register", {
        nombre,
        email,
        password,
      });

      const { token, user: userData } = data;

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(userData));
      setUser(userData);

      return { success: true };
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
      {children}
    </AuthContext.Provider>
  );
}
