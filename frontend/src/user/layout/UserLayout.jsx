import { NavLink, Outlet, useNavigate, Link } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import { User, ShoppingBag, Shield, LogOut, Store, MessageSquare } from 'lucide-react';

// Es buena práctica definir los objetos estáticos fuera del componente
const navItems = [
    { to: '/cuenta/perfil', label: 'Mi Perfil', icon: User },
    { to: '/cuenta/pedidos', label: 'Mis Pedidos', icon: ShoppingBag },
    { to: '/cuenta/resenas', label: 'Mis Reseñas', icon: MessageSquare },
    { to: '/cuenta/seguridad', label: 'Seguridad', icon: Shield },
];

export default function UserLayout() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
            await logout(); // Si tu logout es una promesa (común en Firebase/Auth)
            navigate('/login');
        } catch (error) {
            console.error("Error al cerrar sesión:", error);
        }
    };

    return (
        <div
            className="relative min-h-screen overflow-hidden bg-background"
            style={{
                backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.04) 1px, transparent 0)',
                backgroundSize: '32px 32px'
            }}
        >
            {/* Fondos decorativos fijos */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
                <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
            </div>

            <div className="relative z-10 max-w-6xl mx-auto px-4 py-10 flex gap-8">
                {/* Sidebar */}
                <aside className="w-64 shrink-0">

                    {/* Botón volver a la tienda - Movido dentro del layout lateral para mejor estructura */}
                    <Link
                        to="/"
                        className="flex items-center gap-3 px-5 py-3.5 mb-4 text-sm font-medium glass-panel border border-border rounded-2xl text-muted hover:bg-primary/5 hover:text-foreground transition-all duration-200"
                    >
                        <Store className="w-4 h-4" />
                        Volver a la tienda
                    </Link>

                    {/* Avatar card */}
                    <div className="glass-panel border border-border rounded-2xl p-6 mb-4 text-center">
                        <div className="w-16 h-16 rounded-full bg-primary/10 border border-primary/20 mx-auto mb-3 flex items-center justify-center">
                            <User className="w-8 h-8 text-primary" />
                        </div>
                        <p className="font-display font-bold text-foreground">
                            {user?.nombre || 'Usuario'}
                        </p>
                        <p className="text-xs text-muted truncate mt-0.5">{user?.email}</p>
                        <span className="inline-block mt-2 text-xs px-2.5 py-0.5 rounded-full bg-primary/10 border border-primary/20 text-primary font-medium">
                            Cliente
                        </span>
                    </div>

                    {/* Nav */}
                    <nav className="glass-panel border border-border rounded-2xl overflow-hidden bg-background/50 backdrop-blur-sm">
                        {navItems.map(({ to, label, icon: Icon }) => (
                            <NavLink
                                key={to}
                                to={to}
                                className={({ isActive }) =>
                                    `flex items-center gap-3 px-5 py-3.5 text-sm font-medium transition-all duration-200
                                    ${isActive
                                        ? 'bg-primary/10 text-primary border-l-2 border-primary'
                                        : 'text-muted hover:bg-primary/5 hover:text-foreground'
                                    }`
                                }
                            >
                                <Icon className="w-4 h-4" />
                                {label}
                            </NavLink>
                        ))}

                        <div className="border-t border-border" />

                        <button
                            onClick={handleLogout}
                            className="w-full flex items-center gap-3 px-5 py-3.5 text-sm font-medium text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all duration-200"
                        >
                            <LogOut className="w-4 h-4" />
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