import { NavLink, Outlet } from "react-router-dom";

export default function UserLayout() {
    return (
        <div className="min-h-screen bg-gray-100">
            {/* Header */}
            <header className="bg-white border-b">
                <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
                    <h1 className="text-lg font-bold">
                        Mi cuenta
                    </h1>

                    <nav className="flex gap-4 text-sm">
                        <NavLink
                            to="/user/orders"
                            className={({ isActive }) =>
                                isActive
                                    ? "font-semibold text-black"
                                    : "text-gray-500 hover:text-black"
                            }
                        >
                            Mis pedidos
                        </NavLink>

                        <NavLink
                            to="/user/account/profile"
                            className={({ isActive }) =>
                                isActive
                                    ? "font-semibold text-black"
                                    : "text-gray-500 hover:text-black"
                            }
                        >
                            Perfil
                        </NavLink>

                        <NavLink
                            to="/user/account/security"
                            className={({ isActive }) =>
                                isActive
                                    ? "font-semibold text-black"
                                    : "text-gray-500 hover:text-black"
                            }
                        >
                            Seguridad
                        </NavLink>
                    </nav>
                </div>
            </header>

            {/* Content */}
            <main className="max-w-6xl mx-auto px-4 py-6">
                <Outlet />
            </main>
        </div>
    );
}
