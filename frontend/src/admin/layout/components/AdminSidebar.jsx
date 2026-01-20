import { NavLink } from "react-router-dom";
import { LayoutDashboard, ShoppingCart, Users, Package, Settings } from "lucide-react";

const linkClass = ({ isActive }) =>
    `group flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${isActive
        ? "bg-white text-black shadow-lg"
        : "text-gray-300 hover:bg-gray-800/70 hover:text-white"
    }`;

export default function AdminSidebar() {
    return (
        <aside className="w-72 min-h-screen flex flex-col bg-gray-950/80 backdrop-blur border-r border-gray-800 shadow-2xl">

            {/* Logo / Brand */}
            <div className="px-6 py-6 border-b border-gray-800">
                <h2 className="text-2xl font-bold text-white tracking-wide">
                    Black Michi
                </h2>
                <p className="text-xs text-gray-400 mt-1">
                    Admin Panel
                </p>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-4 py-6 space-y-2">
                <NavLink to="/admin" end className={linkClass}>
                    <LayoutDashboard size={18} />
                    Dashboard
                </NavLink>

                <NavLink to="/admin/orders" className={linkClass}>
                    <ShoppingCart size={18} />
                    Pedidos
                </NavLink>

                <NavLink to="/admin/users" className={linkClass}>
                    <Users size={18} />
                    Usuarios
                </NavLink>

                <NavLink to="/admin/products" className={linkClass}>
                    <Package size={18} />
                    Productos
                </NavLink>

                <NavLink to="/admin/settings" className={linkClass}>
                    <Settings size={18} />
                    Configuración
                </NavLink>
            </nav>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-gray-800 text-xs text-gray-500">
                © {new Date().getFullYear()} Black Michi Studio
            </div>
        </aside>
    );
}
