// frontend/src/components/HeroSection/HeroSection.jsx
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Autoplay } from 'swiper/modules';
import { useState, useEffect } from 'react';
import 'swiper/css';
import 'swiper/css/navigation';
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import { getImageUrl } from "../../utils/getImageUrl";
import { ChevronRight } from 'lucide-react';

const FALLBACK_SLIDES = [
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
];

export default function HeroSection() {
    const navigate = useNavigate();
    const [slides, setSlides] = useState([]);
    const [firstSlide, setFirstSlide] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeIndex, setActiveIndex] = useState(0);

    useEffect(() => {
        const fetchFirst = async () => {
            try {
                const { data } = await api.get("/hero-images/first");
                if (data?.image_url) {
                    setFirstSlide({ ...data, id: "first" });
                    setLoading(false);
                }
            } catch {
                // silencioso
            }
        };

        const fetchAll = async () => {
            try {
                const { data } = await api.get("/hero-images/public");
                const allSlides = Array.isArray(data) ? data.slice(0, 3) : [];
                setSlides(allSlides.length ? allSlides : FALLBACK_SLIDES);
            } catch {
                setSlides(FALLBACK_SLIDES);
            } finally {
                setLoading(false);
            }
        };

        fetchFirst();
        fetchAll();
    }, []);

    const activeSlides = slides.length > 0
        ? slides
        : firstSlide
            ? [firstSlide]
            : FALLBACK_SLIDES;

    if (loading && !firstSlide) {
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
                    {activeSlides.map(({ id, title, subtitle, image_url, button_text = "Explorar Colección" }, index) => (
                        <SwiperSlide key={id}>
                            <div className="relative h-[300px] sm:h-[380px] md:h-[460px] xl:h-[560px] overflow-hidden bg-background">

                                <img
                                    src={getImageUrl(image_url, 629, 412, 85)}
                                    srcSet={`${getImageUrl(image_url, 400, 260, 80)} 400w, ${getImageUrl(image_url, 629, 412, 85)} 629w, ${getImageUrl(image_url, 900, 590, 85)} 900w`}
                                    sizes="(max-width: 640px) 400px, (max-width: 1024px) 629px, 900px"
                                    alt=""
                                    aria-hidden="true"
                                    fetchPriority={index === 0 ? "high" : "auto"}
                                    loading={index === 0 ? "eager" : "lazy"}
                                    className="absolute inset-0 w-full h-full object-cover opacity-60 scale-110"
                                    style={{ objectPosition: 'right center' }}
                                />

                                <div className="absolute inset-0 bg-gradient-to-r from-background/90 via-background/40 to-transparent z-10" />

                                <img
                                    src={getImageUrl(image_url, 407, 380, 90)}
                                    srcSet={`${getImageUrl(image_url, 300, 280, 85)} 300w, ${getImageUrl(image_url, 407, 380, 90)} 407w, ${getImageUrl(image_url, 560, 520, 90)} 560w`}
                                    sizes="(max-width: 640px) 300px, (max-width: 1024px) 407px, 560px"
                                    alt={title}
                                    fetchPriority={index === 0 ? "high" : "auto"}
                                    loading={index === 0 ? "eager" : "lazy"}
                                    className="absolute right-[8%] top-0 h-full w-auto object-contain z-20"
                                />

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

                                {/* ✅ TOUCH TARGETS CORREGIDOS: padding invisible agranda el área clickeable a 24x24px mínimo */}
                                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30">
                                    <div className="flex items-center gap-1">
                                        {activeSlides.map((_, idx) => (
                                            <button
                                                key={idx}
                                                onClick={() => {
                                                    const swiper = document.querySelector('.swiper')?.swiper;
                                                    if (swiper) swiper.slideToLoop(idx);
                                                }}
                                                className="p-3 flex items-center justify-center"
                                                aria-label={`Ir al slide ${idx + 1}`}
                                            >
                                                <span className={`block rounded-full transition-all duration-300 ${activeIndex === idx
                                                    ? 'w-5 h-2 bg-accent'
                                                    : 'w-2 h-2 bg-muted hover:bg-accent/50'
                                                    }`}
                                                />
                                            </button>
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
