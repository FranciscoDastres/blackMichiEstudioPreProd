import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Autoplay, Pagination } from 'swiper/modules';
import { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";
import { ChevronRight } from 'lucide-react';

import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

// ✅ Configuración de URL base ultra-robusta
const API_URL = import.meta.env.VITE_API_URL || '';
const BASE_URL = API_URL.endsWith('/api') ? API_URL.replace('/api', '') : API_URL;

export default function HeroSection() {
    const navigate = useNavigate();
    const [slides, setSlides] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchHeroImages = async () => {
            try {
                setLoading(true);
                const { data } = await api.get("/hero-images/public");

                if (data && Array.isArray(data)) {
                    const formattedData = data.map(slide => {
                        const imgPath = slide.image_url || slide.image || '';

                        // ✅ Nueva lógica: Si no es una URL externa (http), concatenamos con BASE_URL
                        let finalImage = imgPath;
                        if (imgPath && !imgPath.startsWith('http')) {
                            // Aseguramos que empiece con una sola /
                            const cleanPath = imgPath.startsWith('/') ? imgPath : `/${imgPath}`;
                            finalImage = `${BASE_URL}${cleanPath}`;
                        }

                        return {
                            ...slide,
                            displayImage: finalImage
                        };
                    });
                    setSlides(formattedData.slice(0, 3));
                }
            } catch (error) {
                console.error("Error cargando hero:", error);
                setSlides([{
                    id: "default",
                    title: "Black Michi Studio",
                    subtitle: "Diseños exclusivos",
                    displayImage: "https://images.unsplash.com/photo-1550745165-9bc0b252726f",
                    buttonText: "Explorar"
                }]);
            } finally {
                setLoading(false);
            }
        };
        fetchHeroImages();
    }, []);

    if (loading) return <div className="w-full h-[400px] bg-secondary/20 animate-pulse rounded-3xl" />;

    return (
        <div className="w-full flex justify-center pt-0 px-4 sm:px-8">
            <div className="w-full max-w-[1800px] relative rounded-3xl overflow-hidden shadow-2xl border border-border">
                <Swiper
                    modules={[Navigation, Autoplay, Pagination]}
                    spaceBetween={0}
                    slidesPerView={1}
                    loop={slides.length > 1}
                    autoplay={{ delay: 5000, disableOnInteraction: false }}
                    navigation
                    pagination={{ clickable: true }}
                    className="w-full"
                >
                    {slides.map((slide) => (
                        <SwiperSlide key={slide.id}>
                            <div className="relative h-[300px] sm:h-[460px] xl:h-[560px] flex items-center">
                                {/* Fondo con gradiente y la imagen de fondo con opacidad */}
                                <div className="absolute inset-0 bg-gradient-to-br from-background via-secondary/20 to-background" />
                                <div
                                    className="absolute inset-0 opacity-20 bg-cover bg-center"
                                    style={{ backgroundImage: `url(${slide.displayImage})` }}
                                />

                                <div className="container mx-auto px-6 md:px-24 relative z-10">
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                                        <div className="space-y-6">
                                            <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                                                {slide.title}
                                            </h1>
                                            <p className="text-xl text-muted-foreground max-w-xl">
                                                {slide.subtitle}
                                            </p>
                                            <button
                                                onClick={() => navigate("/productos")}
                                                className="group inline-flex items-center gap-2 px-8 py-4 bg-accent text-accent-foreground rounded-full font-bold hover:scale-105 transition-all shadow-lg"
                                            >
                                                {slide.buttonText || "Explorar Colección"}
                                                <ChevronRight className="group-hover:translate-x-1 transition-transform" />
                                            </button>
                                        </div>

                                        <div className="hidden lg:block relative">
                                            <div className="absolute -inset-10 bg-accent/20 blur-[100px] rounded-full" />
                                            <img
                                                src={slide.displayImage}
                                                alt={slide.title}
                                                className="relative w-full max-w-lg mx-auto rounded-2xl shadow-2xl border border-white/10 object-cover aspect-video lg:aspect-square"
                                                onError={(e) => { e.target.src = "https://images.unsplash.com/photo-1550745165-9bc0b252726f"; }}
                                            />
                                        </div>
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