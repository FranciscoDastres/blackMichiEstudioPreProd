// src/user/pages/Account/Profile.tsx
import { useState } from "react";
import { useAuth } from "../../../contexts/AuthContext";
import { User, Mail, Phone, MapPin, Save, LucideIcon } from "lucide-react";
import api from "../../../services/api";

type ProfileField = "nombre" | "email" | "telefono" | "direccion_defecto";

interface FieldConfig {
    label: string;
    icon: LucideIcon;
    type: string;
    disabled?: boolean;
    placeholder?: string;
}

const fieldConfig: Record<ProfileField, FieldConfig> = {
    nombre:            { label: "Nombre",               icon: User,   type: "text"  },
    email:             { label: "Email",                 icon: Mail,   type: "email", disabled: true },
    telefono:          { label: "Teléfono",              icon: Phone,  type: "text",  placeholder: "+56 9 XXXX XXXX" },
    direccion_defecto: { label: "Dirección por defecto", icon: MapPin, type: "text"  },
};

type FormState = Record<ProfileField, string>;

export default function Profile() {
    const { user, updateUser } = useAuth();
    const typedUser = user as { nombre?: string; email?: string; telefono?: string; direccion_defecto?: string } | null;

    const [form, setForm] = useState<FormState>({
        nombre:            typedUser?.nombre            || "",
        email:             typedUser?.email             || "",
        telefono:          typedUser?.telefono          || "",
        direccion_defecto: typedUser?.direccion_defecto || "",
    });
    const [saved, setSaved] = useState(false);
    const [error, setError] = useState("");
    const [phoneError, setPhoneError] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setPhoneError("");
        if (form.telefono) {
            const clean = form.telefono.replace(/\s/g, '');
            if (!/^\+569\d{8}$/.test(clean)) {
                setPhoneError("Formato inválido. Usa +56 9 XXXX XXXX");
                return;
            }
        }
        try {
            const { data } = await api.put<{ nombre: string; telefono: string; direccion_defecto: string }>("/client/perfil", {
                nombre:            form.nombre,
                telefono:          form.telefono,
                direccion_defecto: form.direccion_defecto,
            });
            updateUser({ nombre: data.nombre, telefono: data.telefono, direccion_defecto: data.direccion_defecto });
            setSaved(true);
            setTimeout(() => setSaved(false), 3000);
        } catch {
            setError("No se pudo guardar. Intenta nuevamente.");
        }
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
                {(Object.entries(fieldConfig) as [ProfileField, FieldConfig][]).map(([field, { label, icon: Icon, type, disabled, placeholder }]) => (
                    <div key={field}>
                        <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                            {label}
                        </label>
                        <div className="relative">
                            <Icon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                            <input
                                type={type}
                                disabled={disabled}
                                value={form[field]}
                                placeholder={placeholder}
                                onChange={(e) => setForm({ ...form, [field]: e.target.value })}
                                className={`w-full bg-gray-800 border rounded-xl pl-11 pr-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-sky-500/50 focus:border-sky-500/50 transition-all disabled:opacity-60 disabled:cursor-not-allowed ${field === 'telefono' && phoneError ? 'border-red-500' : 'border-gray-700'}`}
                            />
                        </div>
                        {field === 'telefono' && phoneError && (
                            <p className="text-red-400 text-xs mt-1">{phoneError}</p>
                        )}
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
                        <p className="text-emerald-400 text-sm mt-3">✓ Cambios guardados correctamente</p>
                    )}
                    {error && (
                        <p className="text-red-400 text-sm mt-3">{error}</p>
                    )}
                </div>
            </form>
        </div>
    );
}
