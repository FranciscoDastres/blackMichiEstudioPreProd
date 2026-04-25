//PrivateRoute.tsx
import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

interface PrivateRouteProps {
  children: React.ReactNode;
  requiredRole?: "admin" | "cliente";
}

export default function PrivateRoute({ children, requiredRole }: PrivateRouteProps) {
  const { loading, isAuthenticated, isAdmin, isClient } = useAuth();

  // ⏳ Esperar a que AuthContext cargue
  if (loading) {
    return null;
  }

  // ❌ No autenticado
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // 🔒 Rol admin requerido
  if (requiredRole === "admin" && !isAdmin) {
    return <Navigate to="/" replace />;
  }

  // 🔒 Rol cliente requerido
  if (requiredRole === "cliente" && !isClient) {
    return <Navigate to="/" replace />;
  }

  // ✅ Todo OK
  return children;
}
