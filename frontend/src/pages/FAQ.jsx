import { useNavigate } from "react-router-dom";
import { ArrowLeft, HelpCircle, ChevronDown } from "lucide-react";
import { useState } from "react";

const faqs = [
    {
        id: 1,
        question: "¿Cuál es el tiempo de entrega de los productos?",
        answer: "Los tiempos de entrega estimados son de 3 a 7 días hábiles desde la confirmación del pago en Santiago de Chile. Este plazo depende de la disponibilidad de stock y las condiciones de fabricación de la impresión 3D."
    },
    {
        id: 2,
        question: "¿Hacen envíos a otras regiones o ciudades?",
        answer: "Actualmente realizamos despachos solo a domicilio en Santiago de Chile. Si requieres información sobre envíos a otras ciudades, te invitamos a contactarnos a contacto@blackmichiestudio.com para evaluar opciones."
    },
    {
        id: 3,
        question: "¿Puedo personalizar un producto?",
        answer: "Sí, ofrecemos productos personalizados. Contáctenos a contacto@blackmichiestudio.com con los detalles de lo que necesitas. Nos comunicaremos contigo para coordinar diseño, presupuesto y tiempo de entrega."
    },
    {
        id: 4,
        question: "¿Qué colores y materiales están disponibles?",
        answer: "Contamos con una variedad de materiales y colores para impresión 3D. Los colores y materiales específicos se detallan en la página de cada producto. Si necesitas una opción no listada, ponte en contacto con nosotros."
    },
    {
        id: 5,
        question: "¿Cuál es la política de devoluciones?",
        answer: "Tienes derecho a retractarte dentro de 10 días hábiles desde la recepción del producto, siempre que esté en perfectas condiciones, sin uso y en su embalaje original. Los costos de devolución corren por tu cuenta. Consulta nuestra sección de Términos y Condiciones para más detalles."
    },
    {
        id: 6,
        question: "¿Qué métodos de pago aceptan?",
        answer: "Aceptamos los medios de pago ofrecidos por nuestra plataforma de pagos. Al momento de checkout, podrás ver todas las opciones disponibles para realizar tu compra de forma segura."
    },
    {
        id: 7,
        question: "¿Emiten boleta electrónica?",
        answer: "Sí, emitimos boleta electrónica por cada transacción, de conformidad con la normativa del Servicio de Impuestos Internos (SII). La recibirás por correo electrónico una vez confirmado tu pago."
    },
    {
        id: 8,
        question: "¿Qué garantía tienen los productos?",
        answer: "Todos nuestros productos cuentan con la garantía legal establecida en la Ley 19.496. En caso de defectos de fabricación, puedes optar por reparación, reposición o devolución del dinero. Contacta a contacto@blackmichiestudio.com con fotos del defecto."
    },
    {
        id: 9,
        question: "¿Las imágenes en el sitio son exactas?",
        answer: "Las imágenes son referenciales y pueden presentar leves variaciones de color o textura respecto al producto final, propias del proceso de fabricación 3D. Garantizamos que el diseño y las dimensiones serán fieles a lo publicado."
    },
    {
        id: 10,
        question: "¿Cómo puedo contactar con el equipo?",
        answer: "Puedes escribir a contacto@blackmichiestudio.com o visitarnos en www.blackmichiestudio.com. Nos encantaría responder tus dudas y ayudarte con lo que necesites."
    }
];

function FAQItem({ faq, isOpen, onToggle }) {
    return (
        <div className="border border-border/30 rounded-lg overflow-hidden hover:border-border/60 transition-colors">
            <button
                onClick={onToggle}
                className="w-full px-6 py-4 flex items-center justify-between hover:bg-primary/5 transition-colors text-left"
            >
                <span className="font-semibold text-foreground pr-4">{faq.question}</span>
                <ChevronDown
                    className={`w-5 h-5 text-primary flex-shrink-0 transition-transform ${isOpen ? "rotate-180" : ""
                        }`}
                />
            </button>
            {isOpen && (
                <div className="px-6 py-4 bg-primary/5 border-t border-border/30">
                    <p className="text-muted text-sm leading-relaxed">{faq.answer}</p>
                </div>
            )}
        </div>
    );
}

export default function FAQ() {
    const navigate = useNavigate();
    const [openId, setOpenId] = useState(null);

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
                        <HelpCircle className="w-7 h-7 text-primary" />
                    </div>
                    <h1 className="text-3xl font-display font-extrabold text-foreground mb-2">
                        Preguntas Frecuentes
                    </h1>
                    <p className="text-muted text-sm">
                        Resolvemos las dudas más comunes sobre compras, envíos y productos
                    </p>
                </div>

                <div className="space-y-3">
                    {faqs.map((faq) => (
                        <FAQItem
                            key={faq.id}
                            faq={faq}
                            isOpen={openId === faq.id}
                            onToggle={() => setOpenId(openId === faq.id ? null : faq.id)}
                        />
                    ))}
                </div>

                <div className="mt-12 glass-panel border border-border/50 rounded-2xl p-8 text-center">
                    <h2 className="text-lg font-semibold text-foreground mb-3">
                        ¿No encuentras lo que buscas?
                    </h2>
                    <p className="text-muted text-sm mb-4">
                        Nuestro equipo está disponible para ayudarte con cualquier pregunta adicional.
                    </p>
                    <a
                        href="mailto:contacto@blackmichiestudio.com"
                        className="inline-block px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors text-sm font-semibold"
                    >
                        Contactar soporte
                    </a>
                </div>

            </div>
        </div>
    );
}
