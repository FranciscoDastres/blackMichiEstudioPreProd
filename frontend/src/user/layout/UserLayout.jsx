// src/user/layout/UserLayout.jsx
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import { User, ShoppingBag, Shield, LogOut } from 'lucide-react';

const navItems = [
    { to: '/cuenta/perfil', label: 'Mi Perfil', icon: User },
    { to: '/cuenta/pedidos', label: 'Mis Pedidos', icon: ShoppingBag },
    { to: '/cuenta/seguridad', label: 'Seguridad', icon: Shield },
];

export default function UserLayout() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950">
            {/* Fondo decorativo */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-sky-500/5 via-transparent to-transparent rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-purple-500/5 via-transparent to-transparent rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 max-w-6xl mx-auto px-4 py-10 flex gap-8">

                {/* Sidebar */}
                <aside className="w-64 shrink-0">
                    {/* Avatar card */}
                    <div className="bg-gray-900/80 border border-gray-800 rounded-2xl p-6 mb-4 text-center shadow-xl">
                        <div className="w-16 h-16 rounded-full bg-sky-500/10 border border-sky-500/20 mx-auto mb-3 flex items-center justify-center">
                            <User className="w-8 h-8 text-sky-400" />
                        </div>
                        <p className="font-semibold text-white">{user?.nombre || 'Usuario'}</p>
                        <p className="text-xs text-gray-400 truncate mt-0.5">{user?.email}</p>
                        <span className="inline-block mt-2 text-xs px-2 py-0.5 rounded-full bg-sky-500/10 border border-sky-500/20 text-sky-400">
                            Cliente
                        </span>
                    </div>

                    {/* Nav */}
                    <nav className="bg-gray-900/80 border border-gray-800 rounded-2xl overflow-hidden shadow-xl">
                        {navItems.map(({ to, label, icon: Icon }) => (
                            <NavLink
                                key={to}
                                to={to}
                                className={({ isActive }) =>
                                    `flex items-center gap-3 px-5 py-3.5 text-sm font-medium transition-all duration-200
                                    ${isActive
                                        ? 'bg-white text-black'
                                        : 'text-gray-400 hover:bg-gray-800/70 hover:text-white'
                                    }`
                                }
                            >
                                <Icon className="w-4 h-4" />
                                {label}
                            </NavLink>
                        ))}
                        <button
                            onClick={handleLogout}
                            className="w-full flex items-center gap-3 px-5 py-3.5 text-sm font-medium text-rose-400 hover:bg-rose-500/10 transition-all duration-200"
                        >
                            <LogOut className="w-4 h-4" />
                            Cerrar sesión
                        </button>
                    </nav>
                </aside>

                {/* Contenido */}
                <main className="flex-1 min-w-0">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}