// src/user/pages/Account/Profile.jsx
import { useState } from 'react';
import { useAuth } from '../../../hooks/useAuth';

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
        <div className="bg-white rounded-2xl shadow-sm p-8">
            <h1 className="text-xl font-bold text-gray-900 mb-6">Mi Perfil</h1>
            <form onSubmit={handleSubmit} className="space-y-5 max-w-md">
                {['nombre', 'email', 'telefono'].map((field) => (
                    <div key={field}>
                        <label className="block text-sm font-medium text-gray-700 capitalize mb-1">
                            {field}
                        </label>
                        <input
                            type={field === 'email' ? 'email' : 'text'}
                            value={form[field]}
                            onChange={(e) => setForm({ ...form, [field]: e.target.value })}
                            className="w-full border border-gray-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
                        />
                    </div>
                ))}
                <button
                    type="submit"
                    className="bg-black text-white px-6 py-2 rounded-lg text-sm hover:bg-gray-800 transition-colors"
                >
                    Guardar cambios
                </button>
                {saved && (
                    <p className="text-green-600 text-sm">✓ Cambios guardados</p>
                )}
            </form>
        </div>
    );
}