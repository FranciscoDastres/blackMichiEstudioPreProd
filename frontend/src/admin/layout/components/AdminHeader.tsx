import { Menu, LogOut } from "lucide-react";
import { useAuth } from "../../../contexts/AuthContext";
import { useNavigate } from "react-router-dom";

interface AdminHeaderProps {
    onToggleSidebar: () => void;
}

export default function AdminHeader({ onToggleSidebar }: AdminHeaderProps) {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        await logout();
        navigate("/");
    };

    return (
        <header className="h-14 bg-gray-900 border-b border-gray-800 flex items-center justify-between px-4 sm:px-6 shrink-0">
            <div className="flex items-center gap-3">
                {/* Hamburger — solo mobile */}
                <button
                    onClick={onToggleSidebar}
                    className="lg:hidden p-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
                    aria-label="Abrir menú"
                >
                    <Menu size={20} />
                </button>
                <span className="font-semibold text-gray-100 text-sm">
                    Panel de administración
                </span>
            </div>

            <div className="flex items-center gap-3">
                <span className="hidden sm:block text-xs text-gray-400 truncate max-w-[180px]">
                    {user?.email}
                </span>
                <button
                    onClick={handleLogout}
                    className="flex items-center gap-1.5 text-xs text-red-400 hover:text-red-300 transition-colors px-2 py-1.5 rounded-lg hover:bg-red-500/10"
                >
                    <LogOut size={14} />
                    <span className="hidden sm:inline">Salir</span>
                </button>
            </div>
        </header>
    );
}
