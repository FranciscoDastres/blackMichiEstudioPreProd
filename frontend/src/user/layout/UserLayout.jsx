// src/user/layout/UserLayout.jsx
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import {
    UserCircleIcon,
    ShoppingBagIcon,
    ShieldCheckIcon,
    ArrowRightOnRectangleIcon,
} from '@heroicons/react/24/outline';

const navItems = [
    { to: '/cuenta/perfil', label: 'Mi Perfil', icon: UserCircleIcon },
    { to: '/cuenta/pedidos', label: 'Mis Pedidos', icon: ShoppingBagIcon },
    { to: '/cuenta/seguridad', label: 'Seguridad', icon: ShieldCheckIcon },
];

export default function UserLayout() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-6xl mx-auto px-4 py-10 flex gap-8">

                {/* Sidebar */}
                <aside className="w-64 shrink-0">
                    <div className="bg-white rounded-2xl shadow-sm p-6 mb-4 text-center">
                        <div className="w-16 h-16 rounded-full bg-gray-200 mx-auto mb-2
              flex items-center justify-center">
                            <UserCircleIcon className="w-10 h-10 text-gray-400" />
                        </div>
                        <p className="font-semibold text-gray-800">{user?.nombre || 'Usuario'}</p>
                        <p className="text-xs text-gray-400 truncate">{user?.email}</p>
                    </div>

                    <nav className="bg-white rounded-2xl shadow-sm overflow-hidden">
                        {navItems.map(({ to, label, icon: Icon }) => (
                            <NavLink
                                key={to}
                                to={to}
                                className={({ isActive }) =>
                                    `flex items-center gap-3 px-5 py-3 text-sm transition-colors
                  ${isActive
                                        ? 'bg-black text-white font-medium'
                                        : 'text-gray-600 hover:bg-gray-50'}`
                                }
                            >
                                <Icon className="w-5 h-5" />
                                {label}
                            </NavLink>
                        ))}
                        <button
                            onClick={handleLogout}
                            className="w-full flex items-center gap-3 px-5 py-3 text-sm
                text-red-500 hover:bg-red-50 transition-colors"
                        >
                            <ArrowRightOnRectangleIcon className="w-5 h-5" />
                            Cerrar sesión
                        </button>
                    </nav>
                </aside>

                {/* Contenido principal */}
                <main className="flex-1 min-w-0">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}
