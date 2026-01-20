import { useAuth } from "../../../contexts/AuthContext";

export default function AdminHeader() {
    const { user, logout } = useAuth();

    return (
        <header className="h-16 bg-white border-b flex items-center justify-between px-6">
            <span className="font-semibold text-gray-800">
                Panel de administración
            </span>

            <div className="flex items-center gap-4">
                <span className="text-sm text-gray-600">
                    {user?.email}
                </span>

                <button
                    onClick={logout}
                    className="text-sm text-red-600 hover:underline"
                >
                    Cerrar sesión
                </button>
            </div>
        </header>
    );
}
