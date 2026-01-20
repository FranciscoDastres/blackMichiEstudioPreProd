//PrivateRoute.jsx
import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export default function PrivateRoute({ children, requiredRole }) {
  const { loading, isAuthenticated, isAdmin, isClient } = useAuth();

  // ⏳ Esperar a que AuthContext cargue
  if (loading) {
    return null; // o spinner si quieres
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
