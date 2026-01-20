// PaymentResult.jsx
import { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import axios from "axios";

export default function PaymentResult() {
    const [searchParams] = useSearchParams();
    const pedidoId = searchParams.get("pedidoId");

    const [loading, setLoading] = useState(true);
    const [pedido, setPedido] = useState(null);
    const [error, setError] = useState(null);

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
                `${import.meta.env.VITE_API_URL}/payments/pedido/${pedidoId}/status`
            );

            if (response.data.success) {
                setPedido(response.data.pedido);

                if (response.data.pedido.estado === "pagado") {
                    setLoading(false);
                    localStorage.removeItem('pendingOrder');
                    localStorage.removeItem('cart');
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

    // Error al cargar
    if (error && !pedido) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center p-6">
                <div className="max-w-md w-full bg-background rounded-lg shadow-md p-8 text-center border border-border">
                    <div className="text-6xl mb-4">❌</div>
                    <h1 className="text-2xl font-bold text-foreground mb-2">
                        Error
                    </h1>
                    <p className="text-muted mb-6">{error}</p>
                    <Link
                        to="/"
                        className="inline-block bg-primary text-primary-foreground px-6 py-3 rounded-lg hover:bg-primary/90 transition-colors"
                    >
                        Volver al inicio
                    </Link>
                </div>
            </div>
        );
    }

    // Loading inicial
    if (loading && !pedido) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center p-6">
                <div className="max-w-md w-full bg-background rounded-lg shadow-md p-8 text-center border border-border">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-primary mx-auto mb-4"></div>
                    <h2 className="text-xl font-semibold text-foreground mb-2">
                        Consultando tu pago...
                    </h2>
                    <p className="text-muted">Por favor espera un momento</p>
                </div>
            </div>
        );
    }

    if (!pedido) {
        return null;
    }

    const estadoConfig = getEstadoConfig(pedido.estado);

    return (
        <div className="min-h-screen bg-background py-8 px-4">
            <div className="max-w-3xl mx-auto">

                {/* Estado del pago */}
                <div className={`rounded-lg border-2 ${estadoConfig.borderColor} ${estadoConfig.bgColor} p-8 mb-6 text-center`}>
                    <div className={`inline-flex items-center justify-center w-20 h-20 ${estadoConfig.iconBg} rounded-full text-4xl mb-4`}>
                        {estadoConfig.icon}
                    </div>

                    <h1 className={`text-3xl font-bold ${estadoConfig.textColor} mb-2`}>
                        {estadoConfig.title}
                    </h1>

                    <p className={`text-lg ${estadoConfig.textColor} mb-4`}>
                        {estadoConfig.message}
                    </p>

                    {loading && pedido.estado === "pendiente" && (
                        <div className="flex items-center justify-center gap-2 text-sm text-yellow-700 mt-4">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-yellow-700"></div>
                            <span>Verificando pago...</span>
                        </div>
                    )}

                    {/* Información del pedido */}
                    <div className="mt-6 pt-6 border-t border-border">
                        <div className="flex justify-between items-center text-sm mb-2">
                            <span className={estadoConfig.textColor}>Número de pedido:</span>
                            <span className={`font-mono font-bold ${estadoConfig.textColor}`}>
                                #{pedido.id}
                            </span>
                        </div>
                        {pedido.commerceOrder && (
                            <div className="flex justify-between items-center text-sm">
                                <span className={estadoConfig.textColor}>ID de orden:</span>
                                <span className={`font-mono text-xs ${estadoConfig.textColor}`}>
                                    {pedido.commerceOrder}
                                </span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Detalles del pedido */}
                <div className="bg-background rounded-lg shadow-md p-6 mb-6 border border-border">
                    <h2 className="text-xl font-bold text-foreground mb-4">
                        Detalles del pedido
                    </h2>

                    {/* Información del comprador */}
                    <div className="mb-6 pb-6 border-b border-border">
                        <h3 className="font-semibold text-muted mb-3">
                            Información de contacto
                        </h3>
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-muted">Nombre:</span>
                                <span className="font-medium text-foreground">
                                    {pedido.comprador.nombre}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted">Email:</span>
                                <span className="font-medium text-foreground">
                                    {pedido.comprador.email}
                                </span>
                            </div>
                            {pedido.comprador.telefono && (
                                <div className="flex justify-between">
                                    <span className="text-muted">Teléfono:</span>
                                    <span className="font-medium text-foreground">
                                        {pedido.comprador.telefono}
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Productos */}
                    <div className="mb-6">
                        <h3 className="font-semibold text-muted mb-3">Productos</h3>
                        <div className="space-y-3">
                            {pedido.items.map((item, index) => (
                                <div
                                    key={index}
                                    className="flex items-center gap-4 p-3 bg-muted/20 rounded-lg"
                                >
                                    {item.imagen && (
                                        <img
                                            src={item.imagen}
                                            alt={item.titulo}
                                            className="w-16 h-16 object-cover rounded"
                                            onError={(e) => {
                                                e.target.src = '/placeholder-product.png';
                                            }}
                                        />
                                    )}
                                    <div className="flex-1">
                                        <div className="font-medium text-foreground">
                                            {item.titulo}
                                        </div>
                                        <div className="text-sm text-muted">
                                            Cantidad: {item.cantidad}
                                        </div>
                                    </div>
                                    <div className="font-bold text-foreground">
                                        {CLP.format(item.subtotal)}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Dirección de envío */}
                    {pedido.direccionEnvio && (
                        <div className="mb-6 pb-6 border-b border-border">
                            <h3 className="font-semibold text-muted mb-2">
                                Dirección de envío
                            </h3>
                            <p className="text-sm text-muted">{pedido.direccionEnvio}</p>
                        </div>
                    )}

                    {/* Notas */}
                    {pedido.notas && (
                        <div className="mb-6 pb-6 border-b border-border">
                            <h3 className="font-semibold text-muted mb-2">
                                Notas del pedido
                            </h3>
                            <p className="text-sm text-muted">{pedido.notas}</p>
                        </div>
                    )}

                    {/* Totales */}
                    <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                            <span className="text-muted">Subtotal:</span>
                            <span className="text-foreground">
                                {CLP.format(pedido.total - pedido.costoEnvio)}
                            </span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-muted">Envío:</span>
                            <span className="text-foreground">
                                {CLP.format(pedido.costoEnvio)}
                            </span>
                        </div>
                        <div className="flex justify-between text-lg font-bold pt-2 border-t-2 border-border">
                            <span>Total:</span>
                            <span>{CLP.format(pedido.total)}</span>
                        </div>
                    </div>
                </div>

                {/* Mensajes según estado */}
                {pedido.estado === "pagado" && (
                    <div className="bg-primary/10 border border-primary/20 rounded-lg p-6 mb-6">
                        <h3 className="font-semibold text-primary mb-2">
                            📧 ¿Qué sigue?
                        </h3>
                        <ul className="text-sm text-primary space-y-2">
                            <li>• Recibirás un email de confirmación en {pedido.comprador.email}</li>
                            <li>• Procesaremos tu pedido en las próximas 24-48 horas</li>
                            <li>• Te notificaremos cuando tu pedido sea enviado</li>
                        </ul>
                    </div>
                )}

                {pedido.estado === "rechazado" && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-6">
                        <h3 className="font-semibold text-red-900 mb-2">
                            ¿Qué puedes hacer?
                        </h3>
                        <ul className="text-sm text-red-800 space-y-2">
                            <li>• Verifica que tu tarjeta tenga fondos suficientes</li>
                            <li>• Intenta con otro método de pago</li>
                            <li>• Contacta a tu banco si el problema persiste</li>
                        </ul>
                    </div>
                )}

                {/* Botones de acción */}
                <div className="flex flex-col sm:flex-row gap-4">
                    <Link
                        to="/"
                        className="flex-1 bg-primary text-primary-foreground text-center py-3 px-6 rounded-lg hover:bg-primary/90 transition-colors font-semibold"
                    >
                        Volver al inicio
                    </Link>

                    {pedido.estado === "rechazado" && (
                        <Link
                            to="/checkout"
                            className="flex-1 bg-muted text-foreground text-center py-3 px-6 rounded-lg hover:bg-muted/80 transition-colors font-semibold"
                        >
                            Intentar nuevamente
                        </Link>
                    )}
                </div>

                {/* Soporte */}
                <div className="mt-6 text-center text-sm text-muted">
                    ¿Tienes problemas? {" "}
                    <a
                        href="mailto:contacto@blackmichiestudio.com"
                        className="text-primary hover:text-primary/80 underline"
                    >
                        Contáctanos
                    </a>
                </div>
            </div>
        </div>
    );
}