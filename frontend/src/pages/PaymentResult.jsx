import { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import axios from "axios";
// 1. Agregamos el import del hook
import useCart from "../hooks/useCart";

export default function PaymentResult() {
    const [searchParams] = useSearchParams();
    const pedidoId = searchParams.get("pedidoId");

    const [loading, setLoading] = useState(true);
    const [pedido, setPedido] = useState(null);
    const [error, setError] = useState(null);

    // 2. Extraemos clearCart del hook
    const { clearCart } = useCart();

    const CLP = new Intl.NumberFormat("es-CL", {
        style: "currency",
        currency: "CLP",
        maximumFractionDigits: 0,
    });

    useEffect(() => {
        if (!pedidoId) {
            setError("No se encontró el ID del pedido");
            setLoading(false);
            return;
        }

        fetchPedidoStatus();

        const interval = setInterval(() => {
            fetchPedidoStatus();
        }, 3000);

        const timeout = setTimeout(() => {
            clearInterval(interval);
            setLoading(false);
        }, 30000);

        return () => {
            clearInterval(interval);
            clearTimeout(timeout);
        };
    }, [pedidoId]);

    const fetchPedidoStatus = async () => {
        try {
            const response = await axios.get(
                `${import.meta.env.VITE_API_BASE_URL}/api/payments/pedido/${pedidoId}/status`
            );

            if (response.data.success) {
                setPedido(response.data.pedido);

                // 3. Reemplazamos la limpieza manual por clearCart()
                if (response.data.pedido.estado === "pagado") {
                    setLoading(false);
                    // Esto limpia localStorage Y el estado global de React al mismo tiempo
                    clearCart();
                    localStorage.removeItem('pendingOrder');
                } else if (
                    response.data.pedido.estado === "rechazado" ||
                    response.data.pedido.estado === "cancelado"
                ) {
                    setLoading(false);
                }
            }
        } catch (err) {
            console.error("Error consultando pedido:", err);
            setError(
                err.response?.data?.message ||
                "Error al consultar el estado del pedido"
            );
            setLoading(false);
        }
    };

    const getEstadoConfig = (estado) => {
        const configs = {
            pagado: {
                icon: "✅",
                title: "¡Pago Exitoso!",
                message: "Tu pago ha sido confirmado correctamente",
                bgColor: "bg-green-50",
                borderColor: "border-green-200",
                textColor: "text-green-800",
                iconBg: "bg-green-100"
            },
            pendiente: {
                icon: "⏳",
                title: "Pago Pendiente",
                message: "Estamos esperando la confirmación de Flow",
                bgColor: "bg-yellow-50",
                borderColor: "border-yellow-200",
                textColor: "text-yellow-800",
                iconBg: "bg-yellow-100"
            },
            rechazado: {
                icon: "❌",
                title: "Pago Rechazado",
                message: "Tu pago no pudo ser procesado",
                bgColor: "bg-red-50",
                borderColor: "border-red-200",
                textColor: "text-red-800",
                iconBg: "bg-red-100"
            },
            cancelado: {
                icon: "⚠️",
                title: "Pago Cancelado",
                message: "El pago fue cancelado",
                bgColor: "bg-gray-50",
                borderColor: "border-gray-200",
                textColor: "text-gray-800",
                iconBg: "bg-gray-100"
            }
        };

        return configs[estado] || configs.pendiente;
    };

    // --- El resto del renderizado (JSX) se mantiene igual ---
    if (error && !pedido) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center p-6">
                <div className="max-w-md w-full bg-background rounded-lg shadow-md p-8 text-center border border-border">
                    <div className="text-6xl mb-4">❌</div>
                    <h1 className="text-2xl font-bold text-foreground mb-2">Error</h1>
                    <p className="text-muted mb-6">{error}</p>
                    <Link to="/" className="inline-block bg-primary text-primary-foreground px-6 py-3 rounded-lg hover:bg-primary/90 transition-colors">
                        Volver al inicio
                    </Link>
                </div>
            </div>
        );
    }

    if (loading && !pedido) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center p-6">
                <div className="max-w-md w-full bg-background rounded-lg shadow-md p-8 text-center border border-border">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-primary mx-auto mb-4"></div>
                    <h2 className="text-xl font-semibold text-foreground mb-2">Consultando tu pago...</h2>
                    <p className="text-muted">Por favor espera un momento</p>
                </div>
            </div>
        );
    }

    if (!pedido) return null;
    const estadoConfig = getEstadoConfig(pedido.estado);

    return (
        <div className="min-h-screen bg-background py-8 px-4">
            <div className="max-w-3xl mx-auto">
                <div className={`rounded-lg border-2 ${estadoConfig.borderColor} ${estadoConfig.bgColor} p-8 mb-6 text-center`}>
                    <div className={`inline-flex items-center justify-center w-20 h-20 ${estadoConfig.iconBg} rounded-full text-4xl mb-4`}>
                        {estadoConfig.icon}
                    </div>
                    <h1 className={`text-3xl font-bold ${estadoConfig.textColor} mb-2`}>{estadoConfig.title}</h1>
                    <p className={`text-lg ${estadoConfig.textColor} mb-4`}>{estadoConfig.message}</p>

                    {loading && pedido.estado === "pendiente" && (
                        <div className="flex items-center justify-center gap-2 text-sm text-yellow-700 mt-4">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-yellow-700"></div>
                            <span>Verificando pago...</span>
                        </div>
                    )}
                </div>

                {/* Detalles del pedido, Totales y Botones se mantienen igual que en tu código original */}
                {/* ... (resto del JSX) ... */}
                <div className="flex flex-col sm:flex-row gap-4">
                    <Link to="/" className="flex-1 bg-primary text-primary-foreground text-center py-3 px-6 rounded-lg hover:bg-primary/90 transition-colors font-semibold">
                        Volver al inicio
                    </Link>
                    {pedido.estado === "rechazado" && (
                        <Link to="/checkout" className="flex-1 bg-muted text-foreground text-center py-3 px-6 rounded-lg hover:bg-muted/80 transition-colors font-semibold">
                            Intentar nuevamente
                        </Link>
                    )}
                </div>
            </div>
        </div>
    );
}