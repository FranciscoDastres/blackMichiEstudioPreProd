import { NavLink, Link } from "react-router-dom";
import { LayoutDashboard, ShoppingCart, Users, Package, Settings, X, Store, Tag, LucideIcon } from "lucide-react";

interface NavItem {
    to: string;
    label: string;
    icon: LucideIcon;
    end?: boolean;
}

const navItems: NavItem[] = [
    { to: "/admin", label: "Dashboard", icon: LayoutDashboard, end: true },
    { to: "/admin/orders", label: "Pedidos", icon: ShoppingCart },
    { to: "/admin/users", label: "Usuarios", icon: Users },
    { to: "/admin/products", label: "Productos", icon: Package },
    { to: "/admin/coupons", label: "Cupones", icon: Tag },
    { to: "/admin/settings", label: "Configuración", icon: Settings },
];

const linkClass = ({ isActive }: { isActive: boolean }) =>
    `group flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${isActive
        ? "bg-white text-black shadow-lg"
        : "text-gray-300 hover:bg-gray-800/70 hover:text-white"
    }`;

interface AdminSidebarProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function AdminSidebar({ isOpen, onClose }: AdminSidebarProps) {
    return (
        <>
            {/* Overlay mobile */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/60 z-40 lg:hidden"
                    onClick={onClose}
                />
            )}

            {/* Sidebar */}
            <aside className={`
                fixed inset-y-0 left-0 z-50 w-64 flex flex-col
                bg-gray-950/95 backdrop-blur border-r border-gray-800 shadow-2xl
                transform transition-transform duration-300 ease-in-out
                lg:relative lg:translate-x-0 lg:z-auto lg:w-72
                ${isOpen ? "translate-x-0" : "-translate-x-full"}
            `}>

                {/* Header sidebar */}
                <div className="flex items-center justify-between px-6 py-6 border-b border-gray-800">
                    <div>
                        <h2 className="text-xl font-bold text-white tracking-wide">Black Michi</h2>
                        <p className="text-xs text-gray-400 mt-0.5">Admin Panel</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="lg:hidden p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* Navigation */}
                <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
                    {navItems.map(({ to, label, icon: Icon, end }) => (
                        <NavLink
                            key={to}
                            to={to}
                            end={end}
                            className={linkClass}
                            onClick={onClose}
                        >
                            <Icon size={18} />
                            {label}
                        </NavLink>
                    ))}
                </nav>

                {/* Footer */}
                <div className="px-4 py-4 border-t border-gray-800 space-y-2">
                    <Link
                        to="/"
                        onClick={onClose}
                        className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm text-gray-400 hover:text-white hover:bg-gray-800/70 transition-all"
                    >
                        <Store size={16} />
                        Ver tienda
                    </Link>
                    <p className="text-xs text-gray-600 px-4">
                        © {new Date().getFullYear()} Black Michi Studio
                    </p>
                </div>
            </aside>
        </>
    );
}
