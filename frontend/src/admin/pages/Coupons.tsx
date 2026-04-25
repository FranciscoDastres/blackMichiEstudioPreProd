// frontend/src/admin/pages/Coupons.tsx
import { useEffect, useState } from "react";
import { Tag, Plus, Pencil, Trash2, X, Check } from "lucide-react";
import { toast } from "sonner";
import api from "../../services/api";

const CLP = new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    maximumFractionDigits: 0,
});

interface Cupon {
    id: number;
    codigo: string;
    descripcion?: string;
    tipo: "porcentaje" | "monto_fijo";
    valor: number;
    monto_minimo?: number;
    usos_maximos?: number | null;
    usos_actuales: number;
    fecha_expiracion?: string | null;
    activo: boolean;
}

interface CuponForm {
    codigo: string;
    descripcion: string;
    tipo: string;
    valor: number | string;
    monto_minimo: number | string;
    usos_maximos: number | string;
    fecha_expiracion: string;
    activo: boolean;
}

const emptyForm: CuponForm = {
    codigo: "",
    descripcion: "",
    tipo: "porcentaje",
    valor: 10,
    monto_minimo: 0,
    usos_maximos: "",
    fecha_expiracion: "",
    activo: true,
};

export default function Coupons() {
    const [cupones, setCupones] = useState<Cupon[]>([]);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [editing, setEditing] = useState<Cupon | null>(null);
    const [form, setForm] = useState<CuponForm>(emptyForm);
    const [saving, setSaving] = useState(false);

    const load = async () => {
        try {
            setLoading(true);
            const res = await api.get<Cupon[]>("/admin/cupones");
            setCupones(Array.isArray(res.data) ? res.data : []);
        } catch {
            toast.error("Error cargando cupones");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        load();
    }, []);

    const openCreate = () => {
        setEditing(null);
        setForm(emptyForm);
        setModalOpen(true);
    };

    const openEdit = (cupon: Cupon) => {
        setEditing(cupon);
        setForm({
            codigo: cupon.codigo,
            descripcion: cupon.descripcion || "",
            tipo: cupon.tipo,
            valor: Number(cupon.valor),
            monto_minimo: Number(cupon.monto_minimo ?? 0),
            usos_maximos: cupon.usos_maximos ?? "",
            fecha_expiracion: cupon.fecha_expiracion
                ? new Date(cupon.fecha_expiracion).toISOString().slice(0, 10)
                : "",
            activo: !!cupon.activo,
        });
        setModalOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.codigo.trim()) {
            toast.error("Código requerido");
            return;
        }
        if (!Number.isFinite(Number(form.valor)) || Number(form.valor) <= 0) {
            toast.error("Valor inválido");
            return;
        }
        setSaving(true);
        try {
            const payload = {
                codigo: form.codigo.trim().toUpperCase(),
                descripcion: form.descripcion.trim() || null,
                tipo: form.tipo,
                valor: Number(form.valor),
                monto_minimo: Number(form.monto_minimo) || 0,
                usos_maximos: form.usos_maximos === "" ? null : Number(form.usos_maximos),
                fecha_expiracion: form.fecha_expiracion || null,
                activo: !!form.activo,
            };
            if (editing) {
                await api.put(`/admin/cupones/${editing.id}`, payload);
                toast.success("Cupón actualizado");
            } else {
                await api.post("/admin/cupones", payload);
                toast.success("Cupón creado");
            }
            setModalOpen(false);
            load();
        } catch (err: unknown) {
            const axiosErr = err as { response?: { data?: { error?: string } } };
            toast.error(axiosErr.response?.data?.error || "Error al guardar");
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm("¿Eliminar cupón? Esta acción no se puede deshacer.")) return;
        try {
            await api.delete(`/admin/cupones/${id}`);
            toast.success("Cupón eliminado");
            load();
        } catch {
            toast.error("Error eliminando cupón");
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Tag className="w-6 h-6 text-primary" />
                    <div>
                        <h1 className="text-2xl font-bold text-white">Cupones</h1>
                        <p className="text-sm text-gray-400">
                            {cupones.length} cupón{cupones.length !== 1 ? "es" : ""}
                        </p>
                    </div>
                </div>
                <button
                    onClick={openCreate}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white text-black font-medium hover:bg-gray-200 transition-colors"
                >
                    <Plus className="w-4 h-4" /> Nuevo cupón
                </button>
            </div>

            <div className="bg-gray-900/60 border border-gray-800 rounded-2xl overflow-hidden">
                {loading ? (
                    <div className="p-8 text-center text-gray-400">Cargando...</div>
                ) : cupones.length === 0 ? (
                    <div className="p-12 text-center text-gray-400">
                        <Tag className="w-10 h-10 mx-auto mb-3 opacity-30" />
                        <p>No hay cupones creados todavía</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-gray-800/60 text-gray-300">
                                <tr>
                                    <th className="text-left px-4 py-3 font-medium">Código</th>
                                    <th className="text-left px-4 py-3 font-medium">Tipo</th>
                                    <th className="text-left px-4 py-3 font-medium">Valor</th>
                                    <th className="text-left px-4 py-3 font-medium">Mín.</th>
                                    <th className="text-left px-4 py-3 font-medium">Usos</th>
                                    <th className="text-left px-4 py-3 font-medium">Expira</th>
                                    <th className="text-left px-4 py-3 font-medium">Estado</th>
                                    <th className="text-right px-4 py-3 font-medium">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-800 text-gray-200">
                                {cupones.map((c) => (
                                    <tr key={c.id} className="hover:bg-gray-800/30">
                                        <td className="px-4 py-3 font-mono font-bold">{c.codigo}</td>
                                        <td className="px-4 py-3">
                                            <span className="px-2 py-0.5 rounded-full text-xs bg-gray-800 border border-gray-700">
                                                {c.tipo === "porcentaje" ? "%" : "$"}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            {c.tipo === "porcentaje" ? `${c.valor}%` : CLP.format(c.valor)}
                                        </td>
                                        <td className="px-4 py-3">
                                            {Number(c.monto_minimo) > 0 ? CLP.format(c.monto_minimo!) : "—"}
                                        </td>
                                        <td className="px-4 py-3">
                                            {c.usos_actuales}
                                            {c.usos_maximos != null ? ` / ${c.usos_maximos}` : ""}
                                        </td>
                                        <td className="px-4 py-3 text-xs text-gray-400">
                                            {c.fecha_expiracion
                                                ? new Date(c.fecha_expiracion).toLocaleDateString("es-CL")
                                                : "—"}
                                        </td>
                                        <td className="px-4 py-3">
                                            {c.activo ? (
                                                <span className="flex items-center gap-1 text-emerald-400 text-xs">
                                                    <Check className="w-3 h-3" /> Activo
                                                </span>
                                            ) : (
                                                <span className="flex items-center gap-1 text-gray-500 text-xs">
                                                    <X className="w-3 h-3" /> Inactivo
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center justify-end gap-1">
                                                <button
                                                    onClick={() => openEdit(c)}
                                                    className="p-1.5 rounded text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
                                                    aria-label="Editar"
                                                >
                                                    <Pencil className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(c.id)}
                                                    className="p-1.5 rounded text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-colors"
                                                    aria-label="Eliminar"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Modal */}
            {modalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60">
                    <form
                        onSubmit={handleSubmit}
                        className="bg-gray-950 border border-gray-800 rounded-2xl p-6 w-full max-w-lg space-y-4 shadow-2xl"
                    >
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-bold text-white">
                                {editing ? "Editar cupón" : "Nuevo cupón"}
                            </h2>
                            <button
                                type="button"
                                onClick={() => setModalOpen(false)}
                                className="p-1 text-gray-400 hover:text-white"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <label className="col-span-2 block">
                                <span className="text-xs text-gray-400">Código</span>
                                <input
                                    type="text"
                                    value={form.codigo}
                                    onChange={(e) => setForm({ ...form, codigo: e.target.value.toUpperCase() })}
                                    className="w-full mt-1 px-3 py-2 bg-gray-900 border border-gray-800 rounded-lg text-white font-mono uppercase focus:border-primary focus:outline-none"
                                    placeholder="DESCUENTO10"
                                    required
                                />
                            </label>

                            <label className="col-span-2 block">
                                <span className="text-xs text-gray-400">Descripción (opcional)</span>
                                <input
                                    type="text"
                                    value={form.descripcion}
                                    onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
                                    className="w-full mt-1 px-3 py-2 bg-gray-900 border border-gray-800 rounded-lg text-white focus:border-primary focus:outline-none"
                                    placeholder="Descuento de bienvenida"
                                />
                            </label>

                            <label className="block">
                                <span className="text-xs text-gray-400">Tipo</span>
                                <select
                                    value={form.tipo}
                                    onChange={(e) => setForm({ ...form, tipo: e.target.value })}
                                    className="w-full mt-1 px-3 py-2 bg-gray-900 border border-gray-800 rounded-lg text-white focus:border-primary focus:outline-none"
                                >
                                    <option value="porcentaje">Porcentaje (%)</option>
                                    <option value="monto_fijo">Monto fijo (CLP)</option>
                                </select>
                            </label>

                            <label className="block">
                                <span className="text-xs text-gray-400">
                                    Valor {form.tipo === "porcentaje" ? "(%)" : "(CLP)"}
                                </span>
                                <input
                                    type="number"
                                    min="1"
                                    max={form.tipo === "porcentaje" ? 100 : undefined}
                                    value={form.valor}
                                    onChange={(e) => setForm({ ...form, valor: e.target.value })}
                                    className="w-full mt-1 px-3 py-2 bg-gray-900 border border-gray-800 rounded-lg text-white focus:border-primary focus:outline-none"
                                    required
                                />
                            </label>

                            <label className="block">
                                <span className="text-xs text-gray-400">Monto mínimo (CLP)</span>
                                <input
                                    type="number"
                                    min="0"
                                    value={form.monto_minimo}
                                    onChange={(e) => setForm({ ...form, monto_minimo: e.target.value })}
                                    className="w-full mt-1 px-3 py-2 bg-gray-900 border border-gray-800 rounded-lg text-white focus:border-primary focus:outline-none"
                                />
                            </label>

                            <label className="block">
                                <span className="text-xs text-gray-400">Usos máximos (vacío = ilimitado)</span>
                                <input
                                    type="number"
                                    min="1"
                                    value={form.usos_maximos}
                                    onChange={(e) => setForm({ ...form, usos_maximos: e.target.value })}
                                    className="w-full mt-1 px-3 py-2 bg-gray-900 border border-gray-800 rounded-lg text-white focus:border-primary focus:outline-none"
                                    placeholder="∞"
                                />
                            </label>

                            <label className="col-span-2 block">
                                <span className="text-xs text-gray-400">Fecha de expiración (opcional)</span>
                                <input
                                    type="date"
                                    value={form.fecha_expiracion}
                                    onChange={(e) => setForm({ ...form, fecha_expiracion: e.target.value })}
                                    className="w-full mt-1 px-3 py-2 bg-gray-900 border border-gray-800 rounded-lg text-white focus:border-primary focus:outline-none"
                                />
                            </label>

                            <label className="col-span-2 flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={form.activo}
                                    onChange={(e) => setForm({ ...form, activo: e.target.checked })}
                                    className="w-4 h-4 accent-primary"
                                />
                                <span className="text-sm text-white">Activo</span>
                            </label>
                        </div>

                        <div className="flex justify-end gap-2 pt-2">
                            <button
                                type="button"
                                onClick={() => setModalOpen(false)}
                                className="px-4 py-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
                                disabled={saving}
                            >
                                Cancelar
                            </button>
                            <button
                                type="submit"
                                disabled={saving}
                                className="px-4 py-2 rounded-lg bg-white text-black font-medium hover:bg-gray-200 transition-colors disabled:opacity-50"
                            >
                                {saving ? "Guardando..." : editing ? "Actualizar" : "Crear"}
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
}
