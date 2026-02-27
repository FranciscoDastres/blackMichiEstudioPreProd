import { NavLink, Outlet } from "react-router-dom";

const linkBase =
    "relative px-3 py-2 text-sm font-medium transition-colors";

export default function UserLayout() {
    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white border-b">
                <div className="max-w-6xl mx-auto px-4 py-5">
                    <h1 className="text-xl font-semibold text-gray-900">
                        Mi cuenta
                    </h1>

                    {/* Navigation */}
                    <nav className="mt-4 flex gap-6 border-b">
                        <NavLink
                            to="/user/orders"
                            className={({ isActive }) =>
                                `${linkBase} ${isActive
                                    ? "text-black after:absolute after:left-0 after:-bottom-[1px] after:h-[2px] after:w-full after:bg-black"
                                    : "text-gray-500 hover:text-black"
                                }`
                            }
                        >
                            Mis pedidos
                        </NavLink>

                        <NavLink
                            to="/user/account/profile"
                            className={({ isActive }) =>
                                `${linkBase} ${isActive
                                    ? "text-black after:absolute after:left-0 after:-bottom-[1px] after:h-[2px] after:w-full after:bg-black"
                                    : "text-gray-500 hover:text-black"
                                }`
                            }
                        >
                            Perfil
                        </NavLink>

                        <NavLink
                            to="/user/account/security"
                            className={({ isActive }) =>
                                `${linkBase} ${isActive
                                    ? "text-black after:absolute after:left-0 after:-bottom-[1px] after:h-[2px] after:w-full after:bg-black"
                                    : "text-gray-500 hover:text-black"
                                }`
                            }
                        >
                            Seguridad
                        </NavLink>
                    </nav>
                </div>
            </header>

            {/* Content */}
            <main className="max-w-6xl mx-auto px-4 py-8">
                <div className="bg-white rounded-xl shadow-sm p-6">
                    <Outlet />
                </div>
            </main>
        </div>
    );
}
