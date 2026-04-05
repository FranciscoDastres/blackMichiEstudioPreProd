// frontend/src/components/PaymentReceipt/PaymentReceipt.jsx
import { useEffect, useState, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import useCart from '../../hooks/useCart';
// ✅ ELIMINADAS las importaciones estáticas de html2canvas y jsPDF
// Se cargan dinámicamente solo cuando el usuario hace clic en "Descargar PDF"
import {
    CheckCircle,
    XCircle,
    Clock,
    Download,
    Printer,
    Share2,
    Home,
    Mail,
    Phone,
    MapPin,
    Package,
    CreditCard,
    Truck,
    Sparkles,
    ShoppingBag,
    FileText
} from 'lucide-react';

const PaymentReceipt = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { clearCart } = useCart();
    const [pedido, setPedido] = useState(null);
    const [loading, setLoading] = useState(true);
    const [generating, setGenerating] = useState(false);
    const receiptRef = useRef(null);

    const pedidoId = searchParams.get('pedidoId');
    const token = searchParams.get('token');

    useEffect(() => {
        if (pedidoId) {
            fetchPedido();
        } else {
            const pendingOrder = JSON.parse(localStorage.getItem('pendingOrder') || '{}');
            if (pendingOrder.pedidoId) {
                fetchPedidoById(pendingOrder.pedidoId);
            } else {
                setLoading(false);
            }
        }
    }, [pedidoId]);

    const fetchPedido = async () => {
        try {
            const response = await fetch(
                `${import.meta.env.VITE_API_URL}/api/payments/pedido/${pedidoId}/status`
            );
            const data = await response.json();
            if (data.success) {
                setPedido(data.pedido);
                if (data.pedido.estado === 'pagado') {
                    // Usar clearCart() del contexto para limpiar tanto localStorage
                    // como el estado React (badge del header, sidebar, etc.)
                    clearCart();
                }
            }
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchPedidoById = async (id) => {
        try {
            const response = await fetch(
                `${import.meta.env.VITE_API_URL}/api/payments/pedido/${id}/status`
            );
            const data = await response.json();
            if (data.success) setPedido(data.pedido);
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    const handlePrint = () => window.print();

    // ✅ Carga dinámica: html2canvas y jsPDF solo se descargan cuando se necesitan
    const generatePDF = async () => {
        try {
            const [{ default: html2canvas }, { default: jsPDF }] = await Promise.all([
                import('html2canvas'),
                import('jspdf'),
            ]);

            const element = receiptRef.current;
            const canvas = await html2canvas(element, {
                scale: 2,
                useCORS: true,
                logging: false,
                backgroundColor: 'hsl(240 6% 12%)',
                onclone: (clonedDoc) => {
                    clonedDoc.querySelector('.receipt-container').style.boxShadow = 'none';
                    clonedDoc.querySelectorAll('.print-hidden').forEach(el => el.style.display = 'none');
                }
            });

            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF({
                orientation: 'portrait',
                unit: 'mm',
                format: 'a4',
                compress: true
            });

            const pageWidth = pdf.internal.pageSize.getWidth();
            const pageHeight = pdf.internal.pageSize.getHeight();
            const imgWidth = pageWidth - 20;
            const imgHeight = (canvas.height * imgWidth) / canvas.width;

            pdf.setFillColor(30, 32, 38);
            pdf.rect(0, 0, pageWidth, pageHeight, 'F');
            pdf.addImage(imgData, 'PNG', 10, 10, imgWidth, imgHeight);
            pdf.setFontSize(8);
            pdf.setTextColor(180, 180, 180);
            pdf.text('Black Michi Estudio - Impresiones 3D Personalizadas', pageWidth / 2, pageHeight - 5, { align: 'center' });

            return pdf;
        } catch (error) {
            console.error('Error generando PDF:', error);
            alert('Error al generar el PDF. Intenta nuevamente.');
            return null;
        }
    };

    const handleDownloadPDF = async () => {
        setGenerating(true);
        const pdf = await generatePDF();
        if (pdf) pdf.save(`Boleta-Black-Michi-${pedido.id}.pdf`);
        setGenerating(false);
    };

    const handleShareWhatsApp = async () => {
        if (!pedido) return;
        setGenerating(true);
        try {
            const pdf = await generatePDF();
            if (pdf) {
                pdf.save(`Boleta-Black-Michi-${pedido.id}.pdf`);
                await new Promise(resolve => setTimeout(resolve, 1000));
                const mensaje = `
🎨 *¡Compra confirmada en Black Michi Estudio!*

✨ *Pedido #${pedido.id}*
📦 Order: ${pedido.commerceOrder}
📅 ${formatDate(pedido.fechaCreacion)}
✅ Estado: ${pedido.estado.toUpperCase()}

*Productos comprados:*
${pedido.items.map((item, i) =>
                    `${i + 1}. ${item.titulo}\n   └ ${item.cantidad}x ${formatCurrency(item.precio_unitario)} = ${formatCurrency(item.subtotal)}`
                ).join('\n\n')}

💵 Subtotal: ${formatCurrency(pedido.total - pedido.costoEnvio)}
🚚 Envío: ${formatCurrency(pedido.costoEnvio)}
💰 *TOTAL PAGADO: ${formatCurrency(pedido.total)}*

👤 Cliente: ${pedido.comprador.nombre}
📧 ${pedido.comprador.email}
📍 ${pedido.direccionEnvio}

📎 *El PDF de la boleta se ha descargado.*
_Adjúntalo manualmente al chat de WhatsApp usando el botón de clip 📎_

✨ Gracias por tu compra en Black Michi Estudio ✨
🎨 Impresiones 3D Personalizadas
www.blackmichiestudio.cl
                `.trim();
                const mensajeCodificado = encodeURIComponent(mensaje);
                const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
                const url = isMobile
                    ? `whatsapp://send?text=${mensajeCodificado}`
                    : `https://web.whatsapp.com/send?text=${mensajeCodificado}`;
                window.open(url, '_blank');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Error al generar el PDF. Intenta nuevamente.');
        } finally {
            setGenerating(false);
        }
    };

    const formatCurrency = (amount) => new Intl.NumberFormat('es-CL', {
        style: 'currency', currency: 'CLP'
    }).format(amount);

    const formatDate = (date) => new Date(date).toLocaleDateString('es-CL', {
        year: 'numeric', month: 'long', day: 'numeric',
        hour: '2-digit', minute: '2-digit'
    });

    const getStatusConfig = () => {
        switch (pedido?.estado) {
            case 'pagado':
                return {
                    icon: <CheckCircle className="w-16 h-16" />,
                    title: "¡Pago Confirmado!",
                    subtitle: "Tu pedido está siendo procesado",
                    color: "text-[hsl(195_100%_50%)]",
                    borderColor: "border-[hsl(195_100%_50%)]/30",
                    bgColor: "bg-[hsl(195_100%_50%)]/10"
                };
            case 'rechazado':
                return {
                    icon: <XCircle className="w-16 h-16" />,
                    title: "Pago Rechazado",
                    subtitle: "Hubo un problema con la transacción",
                    color: "text-rose-400",
                    borderColor: "border-rose-500/30",
                    bgColor: "bg-rose-500/10"
                };
            default:
                return {
                    icon: <Clock className="w-16 h-16" />,
                    title: "Pago Pendiente",
                    subtitle: "Esperando confirmación del banco",
                    color: "text-amber-400",
                    borderColor: "border-amber-500/30",
                    bgColor: "bg-amber-500/10"
                };
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center p-4" style={{
                backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255, 255, 255, 0.04) 1px, transparent 0)',
                backgroundSize: '32px 32px'
            }}>
                <div className="text-center">
                    <div className="relative">
                        <div className="absolute inset-0 animate-pulse bg-primary/20 rounded-full blur-xl"></div>
                        <div className="relative animate-spin rounded-full h-20 w-20 border-t-2 border-b-2 border-primary mx-auto mb-6"></div>
                    </div>
                    <p className="text-lg text-muted font-light animate-pulse">Verificando tu pago...</p>
                    <p className="text-sm text-border mt-2">Black Michi Estudio</p>
                </div>
            </div>
        );
    }

    if (!pedido) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center p-4" style={{
                backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255, 255, 255, 0.04) 1px, transparent 0)',
                backgroundSize: '32px 32px'
            }}>
                <div className="text-center max-w-md">
                    <div className="text-6xl mb-6 text-rose-400">❌</div>
                    <h2 className="text-3xl font-display font-extrabold bg-gradient-to-r from-foreground to-muted bg-clip-text text-transparent mb-4">
                        Pedido no encontrado
                    </h2>
                    <p className="text-muted mb-8">El pedido que buscas no existe o ha expirado.</p>
                    <button onClick={() => navigate('/')} className="btn-add-cart px-8 py-3">
                        Volver a la tienda
                    </button>
                </div>
            </div>
        );
    }

    const statusConfig = getStatusConfig();

    return (
        <div className="min-h-screen bg-background py-12 px-4 sm:px-6 lg:px-8" style={{
            backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255, 255, 255, 0.04) 1px, transparent 0)',
            backgroundSize: '32px 32px'
        }}>
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/5 rounded-full blur-3xl"></div>
                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-primary/5 rounded-full blur-3xl"></div>
            </div>

            <div className="relative max-w-4xl mx-auto">
                <div className="text-center mb-8 print:hidden">
                    <div className="inline-flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                            <Sparkles className="w-6 h-6 text-primary-foreground" />
                        </div>
                        <h1 className="text-3xl font-display font-extrabold text-primary">Black Michi Estudio</h1>
                    </div>
                    <p className="text-muted font-light">Impresiones 3D Personalizadas</p>
                </div>

                <div className="mb-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 print:hidden print-hidden">
                    <button onClick={handleShareWhatsApp} disabled={generating}
                        className="glass-panel group relative overflow-hidden rounded-[var(--radius)] p-4 hover:scale-[1.02] transition-all duration-300 disabled:opacity-50 disabled:hover:scale-100">
                        <div className="flex items-center justify-center gap-3">
                            {generating ? (
                                <>
                                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-primary border-t-transparent"></div>
                                    <span className="text-foreground">Generando...</span>
                                </>
                            ) : (
                                <>
                                    <Share2 className="w-5 h-5 text-primary group-hover:text-primary/80" />
                                    <span className="text-foreground group-hover:text-primary">Compartir</span>
                                </>
                            )}
                        </div>
                    </button>

                    <button onClick={handleDownloadPDF} disabled={generating}
                        className="glass-panel group relative overflow-hidden rounded-[var(--radius)] p-4 hover:scale-[1.02] transition-all duration-300 disabled:opacity-50 disabled:hover:scale-100">
                        <div className="flex items-center justify-center gap-3">
                            <Download className="w-5 h-5 text-primary group-hover:text-primary/80" />
                            <span className="text-foreground group-hover:text-primary">Descargar PDF</span>
                        </div>
                    </button>

                    <button onClick={handlePrint}
                        className="glass-panel group relative overflow-hidden rounded-[var(--radius)] p-4 hover:scale-[1.02] transition-all duration-300">
                        <div className="flex items-center justify-center gap-3">
                            <Printer className="w-5 h-5 text-primary group-hover:text-primary/80" />
                            <span className="text-foreground group-hover:text-primary">Imprimir</span>
                        </div>
                    </button>

                    <button onClick={() => navigate('/')}
                        className="glass-panel group relative overflow-hidden rounded-[var(--radius)] p-4 hover:scale-[1.02] transition-all duration-300">
                        <div className="flex items-center justify-center gap-3">
                            <Home className="w-5 h-5 text-primary group-hover:text-primary/80" />
                            <span className="text-foreground group-hover:text-primary">Tienda</span>
                        </div>
                    </button>
                </div>

                <div ref={receiptRef} className="receipt-container glass-panel rounded-2xl overflow-hidden">
                    <div className={`relative p-8 md:p-12 ${statusConfig.bgColor} border-b ${statusConfig.borderColor}`}>
                        <div className="absolute inset-0 bg-foreground/5"></div>
                        <div className="relative flex flex-col md:flex-row items-center justify-between gap-6">
                            <div className="text-center md:text-left">
                                <div className="flex items-center justify-center md:justify-start gap-4 mb-4">
                                    <div className={`p-3 rounded-xl backdrop-blur-sm border ${statusConfig.borderColor} bg-background/80`}>
                                        <div className={statusConfig.color}>{statusConfig.icon}</div>
                                    </div>
                                    <div>
                                        <h1 className="text-3xl md:text-4xl font-display font-extrabold text-foreground mb-2">
                                            {statusConfig.title}
                                        </h1>
                                        <p className="text-muted">{statusConfig.subtitle}</p>
                                    </div>
                                </div>
                            </div>
                            <div className={`px-6 py-3 ${statusConfig.bgColor} rounded-xl border ${statusConfig.borderColor} backdrop-blur-sm`}>
                                <p className="text-2xl font-display font-extrabold text-foreground">#{pedido.id}</p>
                                <p className={`text-sm ${statusConfig.color}`}>Pedido</p>
                            </div>
                        </div>
                    </div>

                    <div className="p-8 md:p-12">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
                            <div className="space-y-6">
                                <div className="flex items-start gap-3">
                                    <div className="p-3 bg-secondary/50 rounded-lg"><Mail className="w-6 h-6 text-primary" /></div>
                                    <div>
                                        <p className="text-sm text-muted mb-1">Cliente</p>
                                        <p className="text-xl font-semibold text-foreground">{pedido.comprador.nombre}</p>
                                        <p className="text-muted">{pedido.comprador.email}</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <div className="p-3 bg-secondary/50 rounded-lg"><MapPin className="w-6 h-6 text-primary" /></div>
                                    <div>
                                        <p className="text-sm text-muted mb-1">Dirección de envío</p>
                                        <p className="text-foreground/90">{pedido.direccionEnvio}</p>
                                    </div>
                                </div>
                                {pedido.comprador.telefono && (
                                    <div className="flex items-start gap-3">
                                        <div className="p-3 bg-secondary/50 rounded-lg"><Phone className="w-6 h-6 text-primary" /></div>
                                        <div>
                                            <p className="text-sm text-muted mb-1">Teléfono</p>
                                            <p className="text-foreground/90">{pedido.comprador.telefono}</p>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="space-y-6">
                                <div className="flex items-start gap-3">
                                    <div className="p-3 bg-secondary/50 rounded-lg"><ShoppingBag className="w-6 h-6 text-primary" /></div>
                                    <div>
                                        <p className="text-sm text-muted mb-1">ID del Pedido</p>
                                        <p className="text-xl font-semibold text-foreground">{pedido.commerceOrder}</p>
                                        <p className="text-muted">{formatDate(pedido.fechaCreacion)}</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <div className="p-3 bg-secondary/50 rounded-lg"><CreditCard className="w-6 h-6 text-primary" /></div>
                                    <div>
                                        <p className="text-sm text-muted mb-1">Método de Pago</p>
                                        <p className="text-foreground/90">Flow / Transbank</p>
                                        {pedido.flowOrder && <p className="text-sm text-muted">Flow: {pedido.flowOrder}</p>}
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <div className="p-3 bg-secondary/50 rounded-lg"><Truck className="w-6 h-6 text-primary" /></div>
                                    <div>
                                        <p className="text-sm text-muted mb-1">Estado de Envío</p>
                                        <p className="text-foreground/90">En preparación</p>
                                        <p className="text-sm text-muted">Recibirás actualizaciones por email</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="mb-12">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-2 bg-primary/10 rounded-lg"><Package className="w-6 h-6 text-primary" /></div>
                                <h3 className="text-2xl font-display font-extrabold text-foreground">Productos Comprados</h3>
                            </div>
                            <div className="space-y-4">
                                {pedido.items.map((item, index) => (
                                    <div key={index} className="group glass-panel rounded-xl p-6 hover:border-primary/40 transition-all duration-300">
                                        <div className="flex items-center justify-between">
                                            <div className="flex-1">
                                                <h4 className="text-lg font-semibold text-foreground mb-2">{item.titulo}</h4>
                                                <div className="flex items-center gap-6 text-sm">
                                                    <span className="text-muted">Cantidad: {item.cantidad}</span>
                                                    <span className="text-muted">Precio unitario: {formatCurrency(item.precio_unitario)}</span>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-2xl font-display font-extrabold text-foreground">{formatCurrency(item.subtotal)}</p>
                                                <p className="text-sm text-muted">Subtotal</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="bg-secondary/30 border border-border rounded-2xl p-8">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-2 bg-primary/10 rounded-lg"><FileText className="w-6 h-6 text-primary" /></div>
                                <h4 className="text-2xl font-display font-extrabold text-foreground">Resumen del Pago</h4>
                            </div>
                            <div className="space-y-4">
                                <div className="flex justify-between items-center py-3 border-b border-border">
                                    <span className="text-muted">Subtotal</span>
                                    <span className="text-xl text-foreground">{formatCurrency(pedido.total - pedido.costoEnvio)}</span>
                                </div>
                                <div className="flex justify-between items-center py-3 border-b border-border">
                                    <span className="text-muted">Costo de envío</span>
                                    <span className="text-xl text-foreground">{formatCurrency(pedido.costoEnvio)}</span>
                                </div>
                                <div className="flex justify-between items-center pt-6">
                                    <span className="text-2xl font-display font-extrabold text-foreground">Total pagado</span>
                                    <div className="text-right">
                                        <div className="price-text text-4xl">{formatCurrency(pedido.total)}</div>
                                        <p className="text-sm text-muted mt-1">CLP - Pesos Chilenos</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {pedido.notas && (
                            <div className="mt-8 p-6 bg-primary/5 border border-primary/20 rounded-2xl">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                                    <p className="text-sm font-semibold text-primary">Notas especiales</p>
                                </div>
                                <p className="text-foreground/90">{pedido.notas}</p>
                            </div>
                        )}
                    </div>

                    <div className="border-t border-border bg-secondary/30 p-8">
                        <div className="text-center">
                            <div className="inline-flex items-center gap-3 mb-4">
                                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                                    <Sparkles className="w-5 h-5 text-primary-foreground" />
                                </div>
                                <h5 className="text-xl font-display font-extrabold text-primary">Black Michi Estudio</h5>
                            </div>
                            <p className="text-muted mb-6 max-w-md mx-auto">
                                Gracias por confiar en nosotros para tus impresiones 3D personalizadas.
                                Cada creación es única, como tú.
                            </p>
                            <div className="flex flex-wrap justify-center gap-6 text-sm text-muted/80">
                                <span>www.blackmichiestudio.cl</span>
                                <span>•</span>
                                <span>contacto@blackmichiestudio.cl</span>
                                <span>•</span>
                                <span>+56 9 XXXX XXXX</span>
                            </div>
                            <div className="mt-8 pt-6 border-t border-border/50">
                                <p className="text-xs text-muted/60">
                                    Este comprobante es válido como documento de compra.
                                    Consérvalo para cualquier consulta o garantía.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mt-8 text-center print:hidden">
                    <p className="text-muted/80 text-sm">
                        ✨ Cada impresión cuenta una historia. Gracias por ser parte de la nuestra.
                    </p>
                </div>
            </div>

            <style>{`
                @media print {
                    body { background: hsl(var(--background)) !important; }
                    .print-hidden { display: none !important; }
                    .receipt-container {
                        box-shadow: none !important;
                        border: 1px solid hsl(var(--border)) !important;
                        max-width: 100% !important;
                        margin: 0 !important;
                    }
                }
                @page { margin: 20mm; }
            `}</style>
        </div>
    );
};

export default PaymentReceipt;
