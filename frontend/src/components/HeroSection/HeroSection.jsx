// Herosection.jsx
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Autoplay } from 'swiper/modules';
import { useState, useEffect } from 'react';
import 'swiper/css';
import 'swiper/css/navigation';
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import { getImageUrl } from "../../utils/getImageUrl";
import { ChevronRight } from 'lucide-react';

export default function HeroSection() {
    const navigate = useNavigate();
    const [slides, setSlides] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeIndex, setActiveIndex] = useState(0);

    useEffect(() => {
        const fetchHeroImages = async () => {
            try {
                setLoading(true);
                const { data } = await api.get("/hero-images/public");
                const firstThreeSlides = Array.isArray(data) ? data.slice(0, 3) : data;
                setSlides(firstThreeSlides);
            } catch (error) {
                console.error("Error cargando hero:", error);
                setSlides([
                    {
                        id: "1",
                        title: "Black Michi Studio",
                        subtitle: "Diseños exclusivos para gamers",
                        image_url: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=800&auto=format&fit=crop",
                        categoria: "all",
                        button_text: "Explorar Colección"
                    },
                    {
                        id: "2",
                        title: "Soportes Personalizados",
                        subtitle: "Arte y funcionalidad en cada diseño",
                        image_url: "https://images.unsplash.com/photo-1593305841991-05c297ba4575?w=800&auto=format&fit=crop",
                        categoria: "soportes",
                        button_text: "Ver Soportes"
                    },
                    {
                        id: "3",
                        title: "Figuras Únicas",
                        subtitle: "Elaboradas completamente a mano",
                        image_url: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&auto=format&fit=crop",
                        categoria: "figuras",
                        button_text: "Ver Figuras"
                    }
                ]);
            } finally {
                setLoading(false);
            }
        };
        fetchHeroImages();
    }, []);

    if (loading) {
        return (
            <div className="w-full flex justify-center pt-0 px-4 sm:px-8">
                <div className="w-full max-w-[1800px] bg-secondary/20 border border-border rounded-3xl overflow-hidden h-[300px] sm:h-[380px] md:h-[460px] xl:h-[560px]" />
            </div>
        );
    }

    return (
        <div className="w-full flex justify-center pt-0 px-4 sm:px-8">
            <div className="w-full max-w-[1800px] relative rounded-3xl overflow-hidden shadow-2xl border border-border h-[300px] sm:h-[380px] md:h-[460px] xl:h-[560px]">
                <Swiper
                    modules={[Navigation, Autoplay]}
                    spaceBetween={0}
                    slidesPerView={1}
                    centeredSlides
                    navigation={{ nextEl: '.swiper-button-next', prevEl: '.swiper-button-prev' }}
                    loop
                    autoplay={{ delay: 5000, disableOnInteraction: false }}
                    speed={800}
                    onSlideChange={(swiper) => setActiveIndex(swiper.realIndex)}
                    className="w-full h-full"
                >
                    {slides.map(({ id, title, subtitle, image_url, categoria, button_text = "Explorar Colección" }, index) => (
                        <SwiperSlide key={id}>
                            <div className="relative h-[300px] sm:h-[380px] md:h-[460px] xl:h-[560px] overflow-hidden bg-background">

                                {/* Imagen de fondo que cubre toda la mitad derecha, difuminada */}
                                <img
                                    src={getImageUrl(image_url, 1024, 670, 85)}
                                    alt=""
                                    aria-hidden="true"
                                    fetchPriority={index === 0 ? "high" : "auto"}
                                    loading={index === 0 ? "eager" : "lazy"}
                                    className="absolute inset-0 w-full h-full object-cover opacity-15 scale-110"
                                    style={{ objectPosition: 'right center' }}
                                />

                                {/* Overlay gradiente: oscuro a la izquierda, transparente a la derecha */}
                                <div className="absolute inset-0 bg-gradient-to-r from-background via-background/80 to-background/10 z-10" />

                                {/* Imagen derecha — absolute, cubre todo el alto, pegada al borde derecho */}
                                <img
                                    src={getImageUrl(image_url, 600, 560, 90)}
                                    alt={title}
                                    fetchPriority={index === 0 ? "high" : "auto"}
                                    loading={index === 0 ? "eager" : "lazy"}
                                    className="absolute right-0 top-0 h-full w-auto object-contain z-20"
                                />

                                {/* Gradiente encima de la imagen para mezclar con el fondo */}
                                <div className="absolute inset-0 bg-gradient-to-r from-background via-background/70 to-transparent z-20 pointer-events-none" />

                                {/* Texto izquierda */}
                                <div className="relative z-30 h-full flex items-center">
                                    <div className="container mx-auto px-6 md:px-12 lg:px-20 xl:px-28">
                                        <div className="text-left space-y-4 md:space-y-6 max-w-lg">
                                            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
                                                <span className="bg-gradient-to-r from-foreground via-foreground/90 to-foreground/70 bg-clip-text text-transparent">
                                                    {title}
                                                </span>
                                            </h1>
                                            <p className="text-base sm:text-lg md:text-xl text-muted-foreground font-light max-w-md">
                                                {subtitle}
                                            </p>
                                            <div className="pt-2">
                                                <button
                                                    onClick={() => navigate("/productos")}
                                                    className="group relative inline-flex items-center gap-3 px-7 py-3.5 bg-gradient-to-r from-accent to-accent/80 text-accent-foreground font-semibold rounded-full overflow-hidden transition-all duration-300 border border-sky-400/40 hover:border-sky-400 shadow-[0_0_15px_rgba(56,189,248,0.2)] hover:shadow-[0_0_25px_rgba(56,189,248,0.5)] hover:-translate-y-0.5"
                                                >
                                                    <span className="relative z-10 text-sm">{button_text}</span>
                                                    <ChevronRight className="relative z-10 w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
                                                    <div className="absolute inset-0 bg-gradient-to-r from-sky-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Dots de navegación */}
                                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30">
                                    <div className="flex items-center gap-2">
                                        {slides.map((_, idx) => (
                                            <button
                                                key={idx}
                                                onClick={() => {
                                                    const swiper = document.querySelector('.swiper')?.swiper;
                                                    if (swiper) swiper.slideToLoop(idx);
                                                }}
                                                className={`rounded-full transition-all duration-300 cursor-pointer ${activeIndex === idx
                                                        ? 'w-5 h-2 bg-accent'
                                                        : 'w-2 h-2 bg-muted hover:bg-accent/50'
                                                    }`}
                                                aria-label={`Ir al slide ${idx + 1}`}
                                            />
                                        ))}
                                    </div>
                                </div>

                            </div>
                        </SwiperSlide>
                    ))}
                </Swiper>
            </div>
        </div>
    );
}
