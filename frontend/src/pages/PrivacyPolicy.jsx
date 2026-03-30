import { useNavigate } from "react-router-dom";
import { ArrowLeft, Lock, Shield, Eye, UserCheck } from "lucide-react";

const sections = [
    {
        id: 1,
        title: "1. Responsable del Tratamiento",
        content: [
            `Blackmichi Estudio, persona natural con domicilio en Santiago de Chile y correo blackmichiestudiosoporte@gmail.com, es responsable del tratamiento de tus datos personales de conformidad con la Ley N.º 19.628 sobre Protección de la Vida Privada y la Ley N.º 21.096 que adhiere la Convención Americana sobre Derechos Humanos.`
        ]
    },
    {
        id: 2,
        title: "2. Datos Personales Recopilados",
        content: [
            `Recopilamos los siguientes datos personales durante el proceso de compra y registro:`
        ],
        items: [
            "Nombre completo",
            "Correo electrónico",
            "Número de teléfono",
            "Dirección de despacho",
            "Datos de pago (procesados por nuestro proveedor de pagos)",
            "Información de navegación (cookies, dirección IP)"
        ]
    },
    {
        id: 3,
        title: "3. Finalidad del Tratamiento",
        content: [
            `Utilizamos tus datos personales para:`
        ],
        items: [
            "Procesar y entregar tu pedido",
            "Enviar confirmaciones y actualizaciones de estado",
            "Emitir boleta electrónica",
            "Comunicarnos sobre promotions y novedades (con tu consentimiento)",
            "Cumplir obligaciones legales y fiscales",
            "Mejorar nuestro servicio y experiencia de usuario"
        ]
    },
    {
        id: 4,
        title: "4. Consentimiento",
        content: [
            `Al realizar una compra en nuestro sitio web, proporcionas tu consentimiento inform para el tratamiento de tus datos personales según esta política. Puedes revocar tu consentimiento en cualquier momento contactando a blackmichiestudiosoporte@gmail.com.`
        ]
    },
    {
        id: 5,
        title: "5. Seguridad de Datos",
        content: [
            `Implementamos medidas técnicas y organizacionales para proteger tus datos personales contra acceso no autorizado, alteración, pérdida o uso indebido. Utilizamos encriptación (https/SSL) para todas las transacciones. Nuestro proveedor de pagos cumple estándares internacionales de seguridad.`,
            `Sin embargo, ninguna transmisión de datos por internet es completamente segura. Mientras hacemos todo lo posible para proteger tu informacion, no podemos garantizar la seguridad absoluta.`
        ]
    },
    {
        id: 6,
        title: "6. Compartir Datos con Terceros",
        content: [
            `Compartimos tus datos únicamente con:`
        ],
        items: [
            "Proveedores de servicios de pago (para procesar transacciones)",
            "Proveedores de despacho (para entregar tu pedido)",
            "Autoridades públicas (cuando sea requerido por ley)",
            "Proveedores de hosting y análisis (para mantener el sitio web)"
        ],
        contentAfter: [
            `Estos terceros se comprometen a mantener la confidencialidad de tus datos y a utilizarlos únicamente para los fines especificados.`
        ]
    },
    {
        id: 7,
        title: "7. Cookies y Tecnologías de Seguimiento",
        content: [
            `Utilizamos cookies para mejorar tu experiencia en nuestro sitio web. Las cookies nos permiten recordar tus preferencias, analizar el tráfico y personalizar contenido. Puedes controlar las cookies mediante la configuración de tu navegador.`
        ]
    },
    {
        id: 8,
        title: "8. Retención de Datos",
        content: [
            `Retenemos tus datos personales durante el tiempo necesario para cumplir con los fines mencionados. Los datos relacionados con transacciones se conservan según lo requerido por la legislación fiscal (normalmente 3 años). Puedes solicitar la eliminación de tus datos cuando no sean necesarios.`
        ]
    },
    {
        id: 9,
        title: "9. Derechos del Titular de Datos",
        content: [
            `De conformidad con la Ley N.º 19.628, tienes derecho a:`
        ],
        items: [
            "Acceder a tus datos personales",
            "Rectificar datos inexactos",
            "Oponerme al tratamiento de tus datos",
            "Solicitar la eliminación de tus datos (derecho al olvido)",
            "Conocer cómo se utilizan tus datos",
            "Recibir tus datos en forma estructurada (portabilidad)"
        ],
        contentAfter: [
            `Para ejercer estos derechos, contáctanos a blackmichiestudiosoporte@gmail.com.`
        ]
    },
    {
        id: 10,
        title: "10. Comunicaciones Comerciales",
        content: [
            `Si consientes al recibir boletines informativos y promociones, enviaremos comunicaciones a tu correo electrónico. Siempre podrás darte de baja mediante el enlace "desuscribirse" en los emails o contactando directamente con nosotros.`
        ]
    },
    {
        id: 11,
        title: "11. Cambios en esta Política",
        content: [
            `Nos reservamos el derecho de actualizar esta Política de Privacidad en cualquier momento. Los cambios serán publicados en nuestro sitio web con indicación de la fecha de actualización. Tu uso continuo del sitio constituye aceptación de la política actualizada.`
        ]
    },
    {
        id: 12,
        title: "12. Contacto",
        content: [
            `Si tienes preguntas sobre nuestra Política de Privacidad o sobre cómo manejamos tus datos personales, puedes contactarnos a:`
        ],
        items: [
            "Email: blackmichiestudiosoporte@gmail.com",
            "Sitio web: www.blackmichiestudio.com"
        ]
    }
];

const highlights = [
    { icon: Shield, label: "Encriptación", desc: "Datos protegidos con SSL/TLS" },
    { icon: Lock, label: "Seguro", desc: "Estándares internacionales" },
    { icon: Eye, label: "Transparente", desc: "Política clara y accesible" },
    { icon: UserCheck, label: "Tu control", desc: "Gestiona tus preferencias" },
];

export default function PrivacyPolicy() {
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
                        <Lock className="w-7 h-7 text-primary" />
                    </div>
                    <h1 className="text-3xl font-display font-extrabold text-foreground mb-2">
                        Política de Privacidad
                    </h1>
                    <p className="text-muted text-sm">
                        Blackmichi Estudio · Última actualización: marzo 2026
                    </p>
                    <p className="text-muted text-sm mt-3 max-w-xl mx-auto">
                        Tu privacidad es importante para nosotros. Te invitamos a leer cómo recopilamos, utilizamos y protegemos tu información.
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
                        ¿Tienes preguntas sobre nuestros datos?{" "}
                        <a
                            href="mailto:blackmichiestudiosoporte@gmail.com"
                            className="text-primary hover:text-primary/80 transition-colors"
                        >
                            blackmichiestudiosoporte@gmail.com
                        </a>
                    </p>
                </div>

            </div>
        </div>
    );
}
