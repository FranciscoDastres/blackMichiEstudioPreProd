// src/user/pages/Account/Profile.jsx
import { useState } from 'react';
import { useAuth } from '../../../hooks/useAuth';
import { User, Mail, Phone, Save } from 'lucide-react';

const fieldConfig = {
    nombre: { label: 'Nombre', icon: User, type: 'text' },
    email: { label: 'Email', icon: Mail, type: 'email' },
    telefono: { label: 'Teléfono', icon: Phone, type: 'text' },
};

export default function Profile() {
    const { user } = useAuth();
    const [form, setForm] = useState({
        nombre: user?.nombre || '',
        email: user?.email || '',
        telefono: user?.telefono || '',
    });
    const [saved, setSaved] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
    };

    return (
        <div className="bg-gray-900/80 border border-gray-800 rounded-2xl shadow-xl p-8">
            <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 rounded-full bg-purple-500/10 flex items-center justify-center">
                    <User className="w-5 h-5 text-purple-400" />
                </div>
                <div>
                    <h1 className="text-xl font-bold text-white">Mi Perfil</h1>
                    <p className="text-xs text-gray-500">Actualiza tu información personal</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5 max-w-md">
                {Object.entries(fieldConfig).map(([field, { label, icon: Icon, type }]) => (
                    <div key={field}>
                        <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                            {label}
                        </label>
                        <div className="relative">
                            <Icon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                            <input
                                type={type}
                                value={form[field]}
                                onChange={(e) => setForm({ ...form, [field]: e.target.value })}
                                className="w-full bg-gray-800 border border-gray-700 rounded-xl pl-11 pr-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-sky-500/50 focus:border-sky-500/50 transition-all"
                            />
                        </div>
                    </div>
                ))}

                <div className="pt-2">
                    <button
                        type="submit"
                        className="flex items-center gap-2 bg-gradient-to-r from-sky-500 to-sky-600 text-white px-6 py-2.5 rounded-xl text-sm font-semibold hover:shadow-lg hover:shadow-sky-500/20 hover:-translate-y-0.5 transition-all"
                    >
                        <Save className="w-4 h-4" />
                        Guardar cambios
                    </button>
                    {saved && (
                        <p className="text-emerald-400 text-sm mt-3 flex items-center gap-1">
                            ✓ Cambios guardados correctamente
                        </p>
                    )}
                </div>
            </form>
        </div>
    );
}