// src/user/pages/Account/Profile.tsx
import { useState, useEffect } from "react";
import { useAuth } from "../../../contexts/AuthContext";
import { User, Mail, Phone, MapPin, Save } from "lucide-react";
import api from "../../../services/api";

function formatPhone(raw: string): string {
    const digits = raw.replace(/\D/g, "");
    const rest = digits.startsWith("56") ? digits.slice(2) : digits;
    let formatted = "+56 ";
    if (rest.length > 0) {
        formatted += rest.charAt(0);
        if (rest.length > 1) formatted += " " + rest.slice(1, 5);
        if (rest.length > 5) formatted += " " + rest.slice(5, 9);
    }
    return formatted;
}

export default function Profile() {
    const { user, updateUser } = useAuth();

    const [nombre, setNombre] = useState(user?.nombre || "");
    const [telefono, setTelefono] = useState(user?.telefono ? formatPhone(user.telefono) : "");
    const [direccion, setDireccion] = useState(user?.direccion_defecto || "");
    const [phoneError, setPhoneError] = useState("");
    const [saved, setSaved] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        api.get<{ nombre: string; telefono: string | null; direccion_defecto: string | null }>("/client/perfil")
            .then(({ data }) => {
                if (data.nombre)            setNombre(data.nombre);
                if (data.telefono)          setTelefono(formatPhone(data.telefono));
                if (data.direccion_defecto) setDireccion(data.direccion_defecto);
            })
            .catch(() => {});
    }, []);

    const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let value = e.target.value;
        if (!value.startsWith("+56")) value = "+56 " + value.replace(/^\+56/, "");
        const prefix = "+56 ";
        const rest = value.slice(prefix.length).replace(/\D/g, "");
        let formatted = prefix;
        if (rest.length > 0) {
            formatted += rest.charAt(0);
            if (rest.length > 1) formatted += " " + rest.slice(1, 5);
            if (rest.length > 5) formatted += " " + rest.slice(5, 9);
        }
        setTelefono(formatted);
        if (rest.length > 0) {
            const clean = formatted.replace(/\s/g, "");
            setPhoneError(/^\+569\d{8}$/.test(clean) ? "" : "Número chileno inválido (+56 9 XXXX XXXX)");
        } else {
            setPhoneError("");
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        if (telefono && telefono.trim() !== "+56 ") {
            const clean = telefono.replace(/\s/g, "");
            if (!/^\+569\d{8}$/.test(clean)) {
                setPhoneError("Número chileno inválido (+56 9 XXXX XXXX)");
                return;
            }
        }
        try {
            const { data } = await api.put<{ nombre: string; telefono: string; direccion_defecto: string }>("/client/perfil", {
                nombre:            nombre.trim(),
                telefono:          telefono.trim() !== "+56 " ? telefono.trim() : null,
                direccion_defecto: direccion.trim() || null,
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

                {/* Nombre */}
                <div>
                    <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Nombre</label>
                    <div className="relative">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                        <input
                            type="text"
                            value={nombre}
                            onChange={(e) => setNombre(e.target.value)}
                            className="w-full bg-gray-800 border border-gray-700 rounded-xl pl-11 pr-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-sky-500/50 focus:border-sky-500/50 transition-all"
                        />
                    </div>
                </div>

                {/* Email (solo lectura) */}
                <div>
                    <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Email</label>
                    <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                        <input
                            type="email"
                            value={user?.email || ""}
                            disabled
                            className="w-full bg-gray-800 border border-gray-700 rounded-xl pl-11 pr-4 py-3 text-sm text-white opacity-60 cursor-not-allowed"
                        />
                    </div>
                </div>

                {/* Teléfono */}
                <div>
                    <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Teléfono</label>
                    <div className="relative">
                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                        <input
                            type="tel"
                            value={telefono}
                            onChange={handlePhoneChange}
                            placeholder="+56 9 XXXX XXXX"
                            className={`w-full bg-gray-800 border rounded-xl pl-11 pr-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-sky-500/50 focus:border-sky-500/50 transition-all ${phoneError ? "border-red-500" : "border-gray-700"}`}
                        />
                    </div>
                    {phoneError && <p className="text-red-400 text-xs mt-1">{phoneError}</p>}
                </div>

                {/* Dirección */}
                <div>
                    <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Dirección por defecto</label>
                    <div className="relative">
                        <MapPin className="absolute left-4 top-3.5 w-4 h-4 text-gray-500" />
                        <textarea
                            value={direccion}
                            onChange={(e) => setDireccion(e.target.value)}
                            placeholder="Calle, número, depto, comuna"
                            rows={2}
                            className="w-full bg-gray-800 border border-gray-700 rounded-xl pl-11 pr-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-sky-500/50 focus:border-sky-500/50 transition-all resize-none"
                        />
                    </div>
                </div>

                <div className="pt-2">
                    <button
                        type="submit"
                        className="flex items-center gap-2 bg-gradient-to-r from-sky-500 to-sky-600 text-white px-6 py-2.5 rounded-xl text-sm font-semibold hover:shadow-lg hover:shadow-sky-500/20 hover:-translate-y-0.5 transition-all"
                    >
                        <Save className="w-4 h-4" />
                        Guardar cambios
                    </button>
                    {saved && <p className="text-emerald-400 text-sm mt-3">✓ Cambios guardados correctamente</p>}
                    {error  && <p className="text-red-400 text-sm mt-3">{error}</p>}
                </div>
            </form>
        </div>
    );
}
