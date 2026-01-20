import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Autoplay } from 'swiper/modules';
import { useState, useEffect } from 'react';
import 'swiper/css';
import 'swiper/css/navigation';
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";
import { ChevronRight } from 'lucide-react';

// ✅ Obtener la URL base del backend (ej: https://blackmichi-backend-latest.onrender.com)
const BASE_URL = import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace('/api', '') : '';

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

                // ✅ Formatear las imágenes para que incluyan la URL de Render si es necesario
                const formattedData = data.map(slide => ({
                    ...slide,
                    // Si la imagen empieza con /uploads, le pegamos la BASE_URL
                    image: slide.image_url?.startsWith('/uploads')
                        ? `${BASE_URL}${slide.image_url}`
                        : (slide.image_url || slide.image)
                }));

                const firstThreeSlides = Array.isArray(formattedData) ? formattedData.slice(0, 3) : formattedData;
                setSlides(firstThreeSlides);
            } catch (error) {
                console.error("Error cargando hero:", error);
                setSlides([
                    {
                        id: "1",
                        title: "Black Michi Studio",
                        subtitle: "Diseños exclusivos para gamers",
                        image: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=800&auto=format&fit=crop",
                        categoria: "all",
                        buttonText: "Explorar Colección"
                    },
                    // ... (tus otros slides de respaldo se mantienen igual)
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
                    {slides.map(({ id, title, subtitle, image, categoria, buttonText = "Explorar Colección" }, index) => (
                        <SwiperSlide key={id}>
                            <div className="relative h-[300px] sm:h-[380px] md:h-[460px] xl:h-[560px] overflow-hidden">
                                <div className="absolute inset-0 bg-gradient-to-br from-background via-secondary/20 to-background z-0"></div>

                                {/* ✅ Imagen de fondo corregida */}
                                <div
                                    className="absolute inset-0 z-0 bg-cover bg-center opacity-20"
                                    style={{ backgroundImage: `url(${image})` }}
                                ></div>

                                <div className="relative z-10 h-full flex items-center">
                                    <div className="container mx-auto px-6 md:px-12 lg:px-24">
                                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center">
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
                                                        className="group relative inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-accent to-accent/80 text-accent-foreground font-semibold rounded-full overflow-hidden transition-all duration-300 border-2 border-sky-400/50 hover:border-sky-400 shadow-[0_0_15px_rgba(56,189,248,0.2)] hover:shadow-[0_0_25px_rgba(56,189,248,0.5)] hover:-translate-y-1"
                                                    >
                                                        <span className="relative z-10">{buttonText}</span>
                                                        <ChevronRight className="relative z-10 w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" />
                                                        <div className="absolute inset-0 bg-gradient-to-r from-sky-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                                    </button>
                                                </div>
                                            </div>

                                            {/* ✅ Imagen flotante corregida */}
                                            <div className="relative hidden lg:block">
                                                <div className="relative">
                                                    <div className="absolute -inset-4 bg-gradient-to-r from-accent/10 to-accent/5 blur-3xl rounded-full"></div>
                                                    <img
                                                        src={image}
                                                        alt={title}
                                                        className="relative w-full max-w-2xl mx-auto rounded-2xl shadow-2xl transform transition-transform duration-700 hover:scale-105"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                {/* ... Resto de la navegación (puntos) ... */}
                            </div>
                        </SwiperSlide>
                    ))}
                </Swiper>
            </div>
        </div>
    );
}