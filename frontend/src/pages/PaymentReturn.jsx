import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import axios from "axios";
import useCart from "../hooks/useCart";

export default function PaymentReturn() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { clearCart } = useCart(); // Hook para limpiar el carrito globalmente
    const [status, setStatus] = useState('loading');
    const [pedido, setPedido] = useState(null);

    useEffect(() => {
        const token = searchParams.get('token');
        const pedidoIdFromUrl = searchParams.get('pedidoId');

        if (!token) {
            setStatus('error');
            return;
        }

        const checkPayment = async () => {
            try {
                const pendingOrder = JSON.parse(localStorage.getItem('pendingOrder') || '{}');
                const pedidoId = pedidoIdFromUrl || pendingOrder.pedidoId;

                if (!pedidoId) {
                    setStatus('error');
                    return;
                }

                // Esperar hasta 15s a que el webhook llegue y actualice el estado
                let intentos = 0;
                const maxIntentos = 5;

                while (intentos < maxIntentos) {
                    intentos++;
                    console.log(`🔍 Intento ${intentos}/${maxIntentos} consultando pedido ${pedidoId}`);

                    const response = await axios.get(
                        `${import.meta.env.VITE_API_BASE_URL}/api/payments/pedido/${pedidoId}/status`
                    );

                    if (response.data.success) {
                        const pedidoData = response.data.pedido;
                        setPedido(pedidoData);

                        if (pedidoData.estado === 'pagado') {
                            console.log('✅ Pago confirmado, limpiando carrito...');

                            // ✅ FIX: Usamos clearCart() que limpia localStorage, estado React y dispara el evento para el Header
                            clearCart();
                            localStorage.removeItem('pendingOrder');

                            setStatus('success');
                            return;

                        } else if (pedidoData.estado === 'rechazado') {
                            setStatus('rejected');
                            return;

                        } else if (pedidoData.estado === 'cancelado') {
                            setStatus('cancelled');
                            return;
                        }
                    }

                    // Si sigue pendiente, esperar 3s y reintentar
                    if (intentos < maxIntentos) {
                        await new Promise(resolve => setTimeout(resolve, 3000));
                    }
                }

                // Si después de 5 intentos sigue pendiente, mostrar pending
                setStatus('pending');

            } catch (error) {
                console.error('❌ Error verificando pago:', error);
                setStatus('error');
            }
        };

        checkPayment();
    }, [searchParams, clearCart]); // 👈 FIX 1: Se agregó clearCart a las dependencias

    // --- Renders de UI (se mantienen igual que tu original) ---

    if (status === 'loading') {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-lg text-foreground font-medium">Verificando tu pago...</p>
                    <p className="text-sm text-muted mt-2">Esto puede tomar unos segundos</p>
                </div>
            </div>
        );
    }

    if (status === 'success') {
        return (
            <div className="min-h-screen flex flex-col justify-center items-center bg-background px-4">
                <div className="glass-panel rounded-2xl p-8 shadow text-center max-w-md w-full border border-green-500/30">
                    <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                        <span className="text-4xl">✅</span>
                    </div>
                    <h2 className="text-2xl font-display font-extrabold text-foreground mb-2">
                        ¡Pago exitoso!
                    </h2>
                    <p className="text-muted mb-1">Pedido #{pedido?.id}</p>
                    <p className="text-sm text-muted mb-6">
                        Recibirás un correo de confirmación en{" "}
                        <span className="text-primary">{pedido?.comprador?.email}</span>
                    </p>
                    <button
                        onClick={() => navigate('/')}
                        className="btn-add-cart w-full !px-6 !py-3 !rounded-xl"
                    >
                        Volver a la tienda
                    </button>
                </div>
            </div>
        );
    }

    if (status === 'pending') {
        return (
            <div className="min-h-screen flex flex-col justify-center items-center bg-background px-4">
                <div className="glass-panel rounded-2xl p-8 shadow text-center max-w-md w-full border border-yellow-500/30">
                    <div className="w-20 h-20 bg-yellow-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                        <span className="text-4xl">⏳</span>
                    </div>
                    <h2 className="text-2xl font-display font-extrabold text-foreground mb-2">
                        Pago pendiente
                    </h2>
                    <p className="text-muted mb-6">
                        Tu pago está siendo procesado. Te notificaremos por correo cuando se confirme.
                    </p>
                    <button
                        onClick={() => navigate('/')}
                        className="btn-add-cart w-full !px-6 !py-3 !rounded-xl"
                    >
                        Volver a la tienda
                    </button>
                </div>
            </div>
        );
    }

    if (status === 'rejected') {
        return (
            <div className="min-h-screen flex flex-col justify-center items-center bg-background px-4">
                <div className="glass-panel rounded-2xl p-8 shadow text-center max-w-md w-full border border-red-500/30">
                    <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                        <span className="text-4xl">❌</span>
                    </div>
                    <h2 className="text-2xl font-display font-extrabold text-foreground mb-2">
                        Pago rechazado
                    </h2>
                    <p className="text-muted mb-6">
                        Tu pago no pudo ser procesado. Verifica tus datos e intenta nuevamente.
                    </p>
                    <div className="flex gap-3">
                        <button
                            onClick={() => navigate('/checkout')}
                            className="btn-add-cart flex-1 !px-4 !py-3 !rounded-xl"
                        >
                            Reintentar
                        </button>
                        <button
                            onClick={() => navigate('/')}
                            className="flex-1 px-4 py-3 rounded-xl glass-panel border border-border text-foreground hover:border-primary/30 transition-colors"
                        >
                            Volver
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col justify-center items-center bg-background px-4">
            <div className="glass-panel rounded-2xl p-8 shadow text-center max-w-md w-full border border-red-500/30">
                <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-4xl">⚠️</span>
                </div>
                <h2 className="text-2xl font-display font-extrabold text-foreground mb-2">
                    {status === 'cancelled' ? 'Pago cancelado' : 'Error en el pago'}
                </h2>
                <p className="text-muted mb-6">
                    {status === 'cancelled'
                        ? 'El pago fue cancelado.'
                        : 'Hubo un problema al procesar tu pago. Por favor intenta nuevamente.'}
                </p>
                <button
                    onClick={() => navigate('/checkout')}
                    className="btn-add-cart w-full !px-6 !py-3 !rounded-xl"
                >
                    Reintentar
                </button>
            </div>
        </div>
    );
}