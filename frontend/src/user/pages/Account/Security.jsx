// src/user/pages/Account/Security.jsx
import { Shield, Lock } from 'lucide-react';

export default function Security() {
    return (
        <div className="bg-gray-900/80 border border-gray-800 rounded-2xl shadow-xl p-8">
            <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center">
                    <Shield className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                    <h1 className="text-xl font-bold text-white">Seguridad</h1>
                    <p className="text-xs text-gray-500">Gestiona tu contraseña y acceso</p>
                </div>
            </div>

            <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6 space-y-4">
                <div className="flex items-center gap-3">
                    <Lock className="w-5 h-5 text-gray-400" />
                    <div>
                        <p className="text-sm font-medium text-white">Contraseña</p>
                        <p className="text-xs text-gray-500">Última actualización: nunca</p>
                    </div>
                </div>
                <p className="text-sm text-gray-400">
                    Aquí podrás cambiar tu contraseña y gestionar la seguridad de tu cuenta.
                </p>
                <button
                    disabled
                    className="flex items-center gap-2 px-4 py-2.5 text-sm rounded-xl bg-gray-700 text-gray-500 cursor-not-allowed border border-gray-600"
                >
                    <Lock className="w-4 h-4" />
                    Cambiar contraseña (próximamente)
                </button>
            </div>
        </div>
    );
}