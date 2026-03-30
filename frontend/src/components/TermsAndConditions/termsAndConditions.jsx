// src/pages/TermsAndConditions.jsx
import { useNavigate } from "react-router-dom";
import { ArrowLeft, FileText, ShieldCheck, Truck, RotateCcw } from "lucide-react";

const sections = [
    {
        id: 1,
        title: "1. Identificación del Vendedor",
        content: [
            `Blackmichi Estudio es un emprendimiento de venta en línea de productos impresos en 3D, operado por persona natural con giro comercial, con domicilio en Santiago de Chile. Correo de contacto: contacto@blackmichiestudio.com. Sitio web: www.blackmichiestudio.com.`
        ]
    },
    {
        id: 2,
        title: "2. Aceptación de los Términos",
        content: [
            `Al realizar una compra en nuestro sitio web, el cliente declara haber leído, entendido y aceptado íntegramente los presentes Términos y Condiciones. Si no está de acuerdo con alguno de estos términos, le rogamos no efectuar compras en nuestra plataforma.`
        ]
    },
    {
        id: 3,
        title: "3. Productos",
        content: [
            `Todos nuestros productos son fabricados mediante impresión 3D. Las imágenes publicadas en el sitio son referenciales y pueden presentar leves variaciones de color o textura respecto al producto final, propias del proceso de fabricación. Nos comprometemos a que el producto entregado sea fiel en diseño y dimensiones a lo publicado.`,
            `Blackmichi Estudio se reserva el derecho de modificar el catálogo de productos, precios y disponibilidad de stock en cualquier momento y sin previo aviso.`
        ]
    },
    {
        id: 4,
        title: "4. Precios y Medios de Pago",
        content: [
            `Todos los precios publicados en el sitio están expresados en Pesos Chilenos (CLP) e incluyen el Impuesto al Valor Agregado (IVA) del 19%, de acuerdo con la legislación tributaria vigente en Chile.`,
            `Los medios de pago disponibles son los ofrecidos por nuestra plataforma de pagos. Blackmichi Estudio emite boleta electrónica por cada transacción, de conformidad con la normativa del Servicio de Impuestos Internos (SII).`
        ]
    },
    {
        id: 5,
        title: "5. Proceso de Compra",
        content: [`El proceso de compra consta de los siguientes pasos:`],
        items: [
            "Selección del producto y cantidad.",
            "Revisión del carrito de compras.",
            "Ingreso de datos de despacho.",
            "Selección y confirmación del medio de pago.",
            "Confirmación del pedido y emisión de comprobante."
        ],
        contentAfter: [
            `Una vez confirmado el pago, el cliente recibirá un correo electrónico con los detalles del pedido y la boleta electrónica correspondiente.`
        ]
    },
    {
        id: 6,
        title: "6. Despacho y Tiempos de Entrega",
        content: [
            `Blackmichi Estudio realiza despachos a domicilio en Santiago de Chile mediante mensajero propio. Los tiempos de entrega estimados son de 3 a 7 días hábiles desde la confirmación del pago, sujetos a disponibilidad de stock y condiciones de fabricación.`,
            `El cliente será notificado por correo electrónico cuando su pedido esté en camino. Es responsabilidad del cliente proporcionar una dirección de despacho correcta y completa. Blackmichi Estudio no se responsabiliza por demoras o extravíos causados por información incorrecta proporcionada por el cliente.`
        ]
    },
    {
        id: 7,
        title: "7. Derecho a Retracto",
        content: [
            `De conformidad con el artículo 3 bis de la Ley N.º 19.496 sobre Protección de los Derechos de los Consumidores, el cliente tiene derecho a retractarse de la compra dentro de los 10 días hábiles siguientes a la recepción del producto, siempre que:`
        ],
        items: [
            "El producto se encuentre en perfectas condiciones, sin uso y en su embalaje original.",
            "El cliente comunique su intención de retracto por escrito a contacto@blackmichiestudio.com dentro del plazo legal.",
            "El costo de devolución del producto será de cargo del cliente."
        ],
        contentAfter: [
            `Una vez recibido el producto en conformidad, Blackmichi Estudio procederá a la devolución del monto pagado dentro de un plazo de 10 días hábiles, mediante el mismo medio de pago utilizado en la compra.`,
            `No procederá el derecho a retracto en productos confeccionados de forma personalizada o a medida según las especificaciones del consumidor.`
        ]
    },
    {
        id: 8,
        title: "8. Garantía Legal",
        content: [
            `Todos los productos comercializados por Blackmichi Estudio cuentan con la garantía legal establecida en la Ley N.º 19.496. En caso de defectos de fabricación o fallas verificables, el cliente podrá optar por la reparación del producto, la reposición o la devolución del precio pagado, en los plazos establecidos por la ley.`,
            `Para hacer efectiva la garantía, el cliente debe comunicarse a contacto@blackmichiestudio.com adjuntando fotografías del defecto y el comprobante de compra.`
        ]
    },
    {
        id: 9,
        title: "9. Limitación de Responsabilidad",
        content: [
            `Blackmichi Estudio no será responsable por daños indirectos, incidentales o consecuentes derivados del uso de los productos. Nuestra responsabilidad máxima se limita al valor del producto adquirido.`
        ]
    },
    {
        id: 10,
        title: "10. Modificaciones",
        content: [
            `Blackmichi Estudio se reserva el derecho de modificar los presentes Términos y Condiciones en cualquier momento. Los cambios serán publicados en el sitio web con indicación de la fecha de actualización. Las compras realizadas antes de los cambios se regirán por los términos vigentes al momento de la transacción.`
        ]
    },
    {
        id: 11,
        title: "11. Legislación Aplicable",
        content: [
            `Los presentes Términos y Condiciones se rigen por las leyes de la República de Chile, en particular la Ley N.º 19.496 de Protección al Consumidor y sus modificaciones. Cualquier controversia será sometida a los Tribunales de Justicia competentes de Santiago de Chile.`
        ]
    }
];

const highlights = [
    { icon: ShieldCheck, label: "Ley 19.496", desc: "Protección al consumidor" },
    { icon: RotateCcw, label: "10 días hábiles", desc: "Derecho a retracto" },
    { icon: Truck, label: "Santiago", desc: "Despacho a domicilio" },
    { icon: FileText, label: "Boleta electrónica", desc: "Por cada transacción" },
];

export default function TermsAndConditions() {
    const navigate = useNavigate();

    return (
        <div
            className="min-h-screen bg-background"
            style={{
                backgroundImage: "radial-gradient(circle at 2px 2px, rgba(255,255,255,0.04) 1px, transparent 0)",
                backgroundSize: "32px 32px",
            }}
        >
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
                <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
            </div>

            <div className="relative z-10 max-w-4xl mx-auto px-4 py-12">

                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 text-muted hover:text-primary transition-colors group mb-8"
                >
                    <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                    <span>Volver</span>
                </button>

                <div className="glass-panel border border-border/50 rounded-2xl p-8 mb-8 text-center">
                    <div className="w-14 h-14 bg-primary/10 border border-primary/20 rounded-xl flex items-center justify-center mx-auto mb-4">
                        <FileText className="w-7 h-7 text-primary" />
                    </div>
                    <h1 className="text-3xl font-display font-extrabold text-foreground mb-2">
                        Términos y Condiciones
                    </h1>
                    <p className="text-muted text-sm">
                        Blackmichi Estudio · Última actualización: marzo 2026
                    </p>
                    <p className="text-muted text-sm mt-3 max-w-xl mx-auto">
                        Al realizar una compra en nuestro sitio, aceptas los presentes términos en su totalidad. Te recomendamos leerlos antes de efectuar cualquier transacción.
                    </p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    {highlights.map(({ icon: Icon, label, desc }) => (
                        <div key={label} className="glass-panel border border-border/50 rounded-xl p-4 text-center">
                            <div className="w-9 h-9 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-2">
                                <Icon className="w-5 h-5 text-primary" />
                            </div>
                            <p className="text-foreground text-sm font-semibold">{label}</p>
                            <p className="text-muted text-xs mt-0.5">{desc}</p>
                        </div>
                    ))}
                </div>

                <div className="glass-panel border border-border/50 rounded-2xl p-8 space-y-8">
                    {sections.map((section) => (
                        <div key={section.id} className="border-b border-border/30 pb-8 last:border-0 last:pb-0">
                            <h2 className="text-lg font-display font-bold text-foreground mb-3">
                                {section.title}
                            </h2>
                            {section.content?.map((p, i) => (
                                <p key={i} className="text-muted text-sm leading-relaxed mb-3">
                                    {p}
                                </p>
                            ))}
                            {section.items && (
                                <ul className="space-y-2 my-3 ml-2">
                                    {section.items.map((item, i) => (
                                        <li key={i} className="flex items-start gap-2 text-sm text-muted">
                                            <span className="text-primary mt-0.5">•</span>
                                            <span>{item}</span>
                                        </li>
                                    ))}
                                </ul>
                            )}
                            {section.contentAfter?.map((p, i) => (
                                <p key={i} className="text-muted text-sm leading-relaxed mb-3">
                                    {p}
                                </p>
                            ))}
                        </div>
                    ))}
                </div>

                <div className="mt-8 text-center">
                    <p className="text-muted text-sm">
                        ¿Tienes dudas?{" "}

                        href="mailto:contacto@blackmichiestudio.com"
                        className="text-primary hover:text-primary/80 transition-colors"
                        <a>
                            contacto@blackmichiestudio.com
                        </a>
                    </p>
                </div>

            </div>
        </div >
    );
}