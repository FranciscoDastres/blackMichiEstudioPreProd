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
                // Solo mostrar los primeros 3 slides
                const firstThreeSlides = Array.isArray(data) ? data.slice(0, 3) : data;
                setSlides(firstThreeSlides);
            } catch (error) {
                console.error("Error cargando hero:", error);
                // Slides de respaldo elegantes
                setSlides([
                    {
                        id: "1",
                        title: "Black Michi Studio",
                        subtitle: "Diseños exclusivos para gamers",
                        image: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=800&auto=format&fit=crop",
                        categoria: "all",
                        buttonText: "Explorar Colección"
                    },
                    {
                        id: "2",
                        title: "Soportes Personalizados",
                        subtitle: "Arte y funcionalidad en cada diseño",
                        image: "https://images.unsplash.com/photo-1593305841991-05c297ba4575?w=800&auto=format&fit=crop",
                        categoria: "soportes",
                        buttonText: "Ver Soportes"
                    },
                    {
                        id: "3",
                        title: "Figuras Únicas",
                        subtitle: "Elaboradas completamente a mano",
                        image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&auto=format&fit=crop",
                        categoria: "figuras",
                        buttonText: "Ver Figuras"
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
                <div className="w-full max-w-[1800px] bg-secondary/20 border border-border rounded-3xl overflow-hidden animate-pulse">
                    <div className="h-[300px] sm:h-[380px] md:h-[460px] xl:h-[560px]"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full flex justify-center pt-0 px-4 sm:px-8">
            <div className="w-full max-w-[1800px] relative rounded-3xl overflow-hidden shadow-2xl border border-border">
                <Swiper
                    modules={[Navigation, Autoplay]}
                    spaceBetween={0}
                    slidesPerView={1}
                    centeredSlides
                    navigation={{
                        nextEl: '.swiper-button-next',
                        prevEl: '.swiper-button-prev',
                    }}
                    loop
                    autoplay={{ delay: 5000, disableOnInteraction: false }}
                    speed={800}
                    onSlideChange={(swiper) => setActiveIndex(swiper.realIndex)}
                    className="w-full"
                >
                    {slides.map(({ id, title, subtitle, image_url, categoria, buttonText = "Explorar Colección" }, index) => (
                        <SwiperSlide key={id}>
                            <div className="relative h-[300px] sm:h-[380px] md:h-[460px] xl:h-[560px] overflow-hidden">
                                {/* Fondo con gradiente usando tus colores */}
                                <div className="absolute inset-0 bg-gradient-to-br from-background via-secondary/20 to-background z-0"></div>

                                {/* Imagen de fondo con overlay - LCP Image */}
                                <img
                                    src={getImageUrl(image_url, 702, 460, 85)}
                                    alt=""
                                    className="absolute inset-0 z-0 w-full h-full object-cover opacity-20"
                                    fetchPriority={index === 0 ? "high" : "auto"}
                                    loading={index === 0 ? "eager" : "lazy"}
                                    srcSet={`
                                        ${getImageUrl(image, 345, 230, 85)} 345w,
                                        ${getImageUrl(image, 702, 460, 85)} 702w,
                                        ${getImageUrl(image, 1024, 670, 85)} 1024w
                                    `.trim().split('\n').join(' ')}
                                    sizes="(max-width: 640px) 345px, (max-width: 1024px) 702px, 1024px"
                                    style={{ objectPosition: 'center' }}
                                    aria-hidden="true"
                                />

                                {/* Contenido principal */}
                                <div className="relative z-10 h-full flex items-center">
                                    <div className="container mx-auto px-6 md:px-12 lg:px-24">
                                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center">
                                            {/* Texto */}
                                            <div className="text-left space-y-4 md:space-y-6">
                                                <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
                                                    <span className="bg-gradient-to-r from-foreground via-foreground/90 to-foreground/80 bg-clip-text text-transparent">
                                                        {title}
                                                    </span>
                                                </h1>

                                                <p className="text-lg sm:text-xl md:text-2xl text-muted-foreground font-light max-w-xl">
                                                    {subtitle}
                                                </p>

                                                <div className="pt-4">
                                                    <button
                                                        onClick={() => navigate("/productos")}
                                                        className="group relative inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-accent to-accent/80 text-accent-foreground font-semibold rounded-full overflow-hidden transition-all duration-300 
                                                        border-2 border-sky-400/50 hover:border-sky-400 shadow-[0_0_15px_rgba(56,189,248,0.2)] hover:shadow-[0_0_25px_rgba(56,189,248,0.5)] hover:-translate-y-1"
                                                    >
                                                        {/* Texto y Icono */}
                                                        <span className="relative z-10">{buttonText}</span>
                                                        <ChevronRight className="relative z-10 w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" />

                                                        {/* Efecto de brillo celeste interno al hacer hover */}
                                                        <div className="absolute inset-0 bg-gradient-to-r from-sky-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                                                        {/* Overlay original para mantener consistencia */}
                                                        <div className="absolute inset-0 bg-accent/90 opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-0"></div>
                                                    </button>
                                                </div>
                                            </div>

                                            {/* Imagen principal */}
                                            <div className="relative hidden lg:block">
                                                <div className="relative">
                                                    <div className="absolute -inset-4 bg-gradient-to-r from-accent/10 to-accent/5 blur-3xl rounded-full"></div>
                                                    <img
                                                        src={getImageUrl(image, 600, 375, 85)}
                                                        alt={title}
                                                        width="800"
                                                        height="500"
                                                        fetchPriority={index === 0 ? "high" : "auto"}
                                                        loading={index === 0 ? "eager" : "lazy"}
                                                        srcSet={`
                                                            ${getImageUrl(image, 400, 250, 85)} 400w,
                                                            ${getImageUrl(image, 600, 375, 85)} 600w,
                                                            ${getImageUrl(image, 800, 500, 85)} 800w
                                                        `.trim().split('\n').join(' ')}
                                                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 800px"
                                                        className="relative w-full max-w-2xl mx-auto rounded-2xl shadow-2xl"
                                                    />
                                                    {/* Efecto de brillo */}
                                                    <div className="absolute -top-10 -right-10 w-40 h-40 bg-gradient-to-r from-accent/20 to-transparent rounded-full blur-2xl"></div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Navegación personalizada - SOLO PUNTOS */}
                                <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20">
                                    <div className="flex items-center gap-2">
                                        {slides.map((_, idx) => (
                                            <button
                                                key={idx}
                                                onClick={() => {
                                                    const swiper = document.querySelector('.swiper')?.swiper;
                                                    if (swiper) {
                                                        swiper.slideToLoop(idx);
                                                    }
                                                }}
                                                className={`w-2 h-2 rounded-full transition-all duration-300 cursor-pointer ${activeIndex === idx
                                                    ? 'bg-accent scale-125'
                                                    : 'bg-muted hover:bg-accent/50'
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