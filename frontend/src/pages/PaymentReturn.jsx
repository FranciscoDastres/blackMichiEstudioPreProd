// PaymentReturn.jsx
import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import axios from "axios";
import useCart from "../hooks/useCart";

export default function PaymentReturn() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { clearCart, cart } = useCart();
    const [status, setStatus] = useState('loading');
    const [pedido, setPedido] = useState(null);

    console.log('🔵 PaymentReturn montado');
    console.log('🛒 Items en carrito:', cart);

    useEffect(() => {
        console.log('🟢 useEffect ejecutándose');
        const token = searchParams.get('token');
        const pedidoIdFromUrl = searchParams.get('pedidoId');

        if (!token) {
            console.log('❌ No hay token');
            setStatus('error');
            return;
        }

        const checkPayment = async () => {
            try {
                console.log('⏳ Esperando 3 segundos...');
                await new Promise(resolve => setTimeout(resolve, 3000));

                const pendingOrder = JSON.parse(localStorage.getItem('pendingOrder') || '{}');
                const pedidoId = pedidoIdFromUrl || pendingOrder.pedidoId;

                console.log('🔍 PedidoId a usar:', pedidoId);

                if (pedidoId) {
                    console.log('🌐 Consultando estado del pedido:', pedidoId);
                    const response = await axios.get(
                        `${import.meta.env.VITE_API_URL}/api/payments/pedido/${pedidoId}/status`
                    );

                    console.log('✅ Respuesta del servidor:', response.data);

                    if (response.data.success) {
                        setPedido(response.data.pedido);

                        if (response.data.pedido.estado === 'pagado') {
                            console.log('✅ Pago exitoso');

                            // ✅ LIMPIAR PRIMERO (antes de cambiar estado)
                            console.log('🗑️ Limpiando carrito AHORA...');

                            // Limpiar directamente localStorage (forzado)
                            localStorage.removeItem('cart');
                            localStorage.removeItem('pendingOrder');

                            // Verificar inmediatamente
                            console.log('🔍 Después de limpiar:', {
                                cart: localStorage.getItem('cart'),
                                pendingOrder: localStorage.getItem('pendingOrder')
                            });

                            // Llamar clearCart del contexto
                            clearCart();

                            // Esperar un tick antes de cambiar estado
                            await new Promise(resolve => setTimeout(resolve, 100));

                            // AHORA cambiar estado
                            setStatus('success');

                        } else if (response.data.pedido.estado === 'rechazado') {
                            console.log('❌ Pago rechazado');
                            setStatus('rejected');
                        } else {
                            console.log('⏳ Pago pendiente');
                            setStatus('pending');
                        }
                    }
                } else {
                    console.log('❌ No hay pedidoId');
                    setStatus('error');
                }
            } catch (error) {
                console.error('❌ Error verificando pago:', error);
                setStatus('error');
            }
        };

        checkPayment();
    }, [searchParams]);

    if (status === 'loading') {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-lg text-foreground">Verificando tu pago...</p>
                </div>
            </div>
        );
    }

    if (status === 'success') {
        return (
            <div className="min-h-screen flex flex-col justify-center items-center bg-background">
                <div className="bg-green-100 rounded-xl p-8 shadow text-center max-w-md border border-green-200">
                    <div className="text-6xl mb-4">✅</div>
                    <h2 className="text-2xl font-bold text-green-700 mb-4">¡Pago exitoso!</h2>
                    <p className="text-foreground mb-2">Pedido #{pedido?.id}</p>
                    <p className="text-sm text-muted mb-2">
                        Recibirás un correo de confirmación en {pedido?.comprador?.email}
                    </p>
                    {/* Debug */}
                    <p className="text-xs text-muted mb-4">
                        Carrito: {cart?.length || 0} items
                    </p>
                    <button
                        onClick={() => {
                            localStorage.removeItem('cart');
                            localStorage.removeItem('pendingOrder');
                            navigate('/');
                        }}
                        className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition font-semibold"
                    >
                        Volver a la tienda
                    </button>
                </div>
            </div>
        );
    }

    if (status === 'pending') {
        return (
            <div className="min-h-screen flex flex-col justify-center items-center bg-background">
                <div className="bg-yellow-100 rounded-xl p-8 shadow text-center max-w-md border border-yellow-200">
                    <div className="text-6xl mb-4">⏳</div>
                    <h2 className="text-2xl font-bold text-yellow-700 mb-4">Pago pendiente</h2>
                    <p className="text-foreground mb-6">
                        Tu pago está siendo procesado. Te notificaremos por correo cuando se confirme.
                    </p>
                    <button
                        onClick={() => navigate('/')}
                        className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition font-semibold"
                    >
                        Volver a la tienda
                    </button>
                </div>
            </div>
        );
    }

    if (status === 'rejected') {
        return (
            <div className="min-h-screen flex flex-col justify-center items-center bg-background">
                <div className="bg-red-100 rounded-xl p-8 shadow text-center max-w-md border border-red-200">
                    <div className="text-6xl mb-4">❌</div>
                    <h2 className="text-2xl font-bold text-red-700 mb-4">Pago rechazado</h2>
                    <p className="text-foreground mb-6">
                        Tu pago no pudo ser procesado. Por favor verifica tus datos e intenta nuevamente.
                    </p>
                    <div className="flex gap-4">
                        <button
                            onClick={() => navigate('/checkout')}
                            className="flex-1 px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition font-semibold"
                        >
                            Reintentar
                        </button>
                        <button
                            onClick={() => navigate('/')}
                            className="flex-1 px-6 py-2 bg-muted text-foreground rounded-lg hover:bg-muted/80 transition font-semibold"
                        >
                            Volver
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col justify-center items-center bg-background">
            <div className="bg-red-100 rounded-xl p-8 shadow text-center max-w-md border border-red-200">
                <div className="text-6xl mb-4">⚠️</div>
                <h2 className="text-2xl font-bold text-red-700 mb-4">Error en el pago</h2>
                <p className="text-foreground mb-6">
                    Hubo un problema al procesar tu pago. Por favor intenta nuevamente.
                </p>
                <button
                    onClick={() => navigate('/checkout')}
                    className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition font-semibold"
                >
                    Reintentar
                </button>
            </div>
        </div>
    );
}