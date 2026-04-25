import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import api from "../services/api";

export interface AuthUser {
  id: number | string;
  email: string;
  nombre?: string;
  rol?: string;
  auth_id?: string;
}

interface AuthResult {
  success: boolean;
  error?: string;
  user?: AuthUser;
}

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isClient: boolean;
  login: (email: string, password: string) => Promise<AuthResult>;
  register: (nombre: string, email: string, password: string) => Promise<AuthResult>;
  loginWithGoogle: (googleToken: string) => Promise<AuthResult>;
  logout: () => Promise<void>;
  updateUser: (updates: Partial<AuthUser>) => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside AuthProvider");
  return context;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem("token");
      if (!token) return setLoading(false);

      try {
        const { data } = await api.get<{ user: AuthUser }>("/auth/me");
        setUser(data.user);
      } catch (error: unknown) {
        const axiosErr = error as { response?: { status?: number } };
        // Solo limpiar el token si el servidor lo rechaza (401), no por errores de red
        if (axiosErr.response?.status === 401) {
          localStorage.removeItem("token");
          localStorage.removeItem("refresh_token");
        }
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (email: string, password: string): Promise<AuthResult> => {
    try {
      const { data } = await api.post<{ token: string; refresh_token?: string; user: AuthUser }>(
        "/auth/login",
        { email, password }
      );
      localStorage.setItem("token", data.token);
      if (data.refresh_token) {
        localStorage.setItem("refresh_token", data.refresh_token);
      }
      setUser(data.user);
      return { success: true };
    } catch (error: unknown) {
      const axiosErr = error as { response?: { data?: { error?: string } } };
      return {
        success: false,
        error: axiosErr.response?.data?.error ?? "Error al iniciar sesión",
      };
    }
  };

  const register = async (nombre: string, email: string, password: string): Promise<AuthResult> => {
    try {
      const { data } = await api.post<{ token: string; user: AuthUser }>(
        "/auth/register",
        { nombre, email, password }
      );
      localStorage.setItem("token", data.token);
      setUser(data.user);
      return { success: true };
    } catch (error: unknown) {
      const axiosErr = error as { response?: { data?: { error?: string } } };
      return {
        success: false,
        error: axiosErr.response?.data?.error ?? "Error al registrarse",
      };
    }
  };

  const loginWithGoogle = async (googleToken: string): Promise<AuthResult> => {
    try {
      const { data } = await api.post<{ token: string; refresh_token?: string; user: AuthUser }>(
        "/auth/google-login",
        { token: googleToken }
      );
      localStorage.setItem("token", data.token);
      if (data.refresh_token) {
        localStorage.setItem("refresh_token", data.refresh_token);
      }
      setUser(data.user);
      return { success: true, user: data.user };
    } catch (error: unknown) {
      const axiosErr = error as { response?: { data?: { error?: string } } };
      return {
        success: false,
        error: axiosErr.response?.data?.error ?? "Error con Google",
      };
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await api.post("/auth/logout");
    } catch {
      // si falla el servidor igual limpiamos localmente
    } finally {
      localStorage.removeItem("token");
      localStorage.removeItem("refresh_token");
      setUser(null);
    }
  };

  const updateUser = (updates: Partial<AuthUser>): void => {
    setUser(prev => prev ? { ...prev, ...updates } : prev);
  };

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      isAuthenticated: !!user,
      isAdmin: user?.rol === "admin",
      isClient: user?.rol === "cliente",
      login,
      register,
      loginWithGoogle,
      logout,
      updateUser,
    }}>
      {children}
    </AuthContext.Provider>
  );
}
