// src/user/pages/Account/Security.tsx
import { useState } from "react";
import { Shield, Lock, Eye, EyeOff } from "lucide-react";
import api from "../../../services/api";

type ShowPasswordKey = "current" | "new" | "confirm";

interface FormState {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
}

interface PasswordField {
    key: keyof FormState;
    label: string;
    show: ShowPasswordKey;
}

export default function Security() {
    const [form, setForm] = useState<FormState>({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
    });
    const [showPasswords, setShowPasswords] = useState<Record<ShowPasswordKey, boolean>>({
        current: false,
        new: false,
        confirm: false,
    });
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setSuccess(false);

        if (form.newPassword.length < 6) {
            setError("La nueva contraseña debe tener al menos 6 caracteres.");
            return;
        }
        if (form.newPassword !== form.confirmPassword) {
            setError("Las contraseñas no coinciden.");
            return;
        }

        setLoading(true);
        try {
            await api.post("/auth/change-password", {
                currentPassword: form.currentPassword,
                newPassword: form.newPassword,
            });
            setSuccess(true);
            setForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
        } catch (err: unknown) {
            const axiosErr = err as { response?: { data?: { error?: string } } };
            setError(axiosErr.response?.data?.error || "Error al cambiar la contraseña.");
        } finally {
            setLoading(false);
        }
    };

    const fields: PasswordField[] = [
        { key: "currentPassword", label: "Contraseña actual",           show: "current" },
        { key: "newPassword",     label: "Nueva contraseña",            show: "new"     },
        { key: "confirmPassword", label: "Confirmar nueva contraseña",  show: "confirm" },
    ];

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

            <form onSubmit={handleSubmit} className="space-y-5 max-w-md">
                {fields.map(({ key, label, show }) => (
                    <div key={key}>
                        <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                            {label}
                        </label>
                        <div className="relative">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                            <input
                                type={showPasswords[show] ? "text" : "password"}
                                value={form[key]}
                                onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                                required
                                className="w-full bg-gray-800 border border-gray-700 rounded-xl pl-11 pr-11 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all"
                                placeholder="••••••••"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPasswords((p) => ({ ...p, [show]: !p[show] }))}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                                aria-label={showPasswords[show] ? "Ocultar contraseña" : "Mostrar contraseña"}
                            >
                                {showPasswords[show] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                        </div>
                    </div>
                ))}

                <div className="pt-2">
                    <button
                        type="submit"
                        disabled={loading}
                        className="flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white px-6 py-2.5 rounded-xl text-sm font-semibold hover:shadow-lg hover:shadow-emerald-500/20 hover:-translate-y-0.5 transition-all disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                    >
                        <Lock className="w-4 h-4" />
                        {loading ? "Cambiando..." : "Cambiar contraseña"}
                    </button>
                    {success && (
                        <p className="text-emerald-400 text-sm mt-3">✓ Contraseña actualizada correctamente</p>
                    )}
                    {error && (
                        <p className="text-red-400 text-sm mt-3">{error}</p>
                    )}
                </div>
            </form>
        </div>
    );
}
