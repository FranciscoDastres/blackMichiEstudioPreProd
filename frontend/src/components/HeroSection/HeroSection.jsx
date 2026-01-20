import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Autoplay } from 'swiper/modules';
import { useState, useEffect } from 'react';
import 'swiper/css';
import 'swiper/css/navigation';
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";
import { ChevronRight } from 'lucide-react';

// ✅ Definir BASE_URL de forma ultra-segura
const API_URL = import.meta.env.VITE_API_URL || '';
const BASE_URL = API_URL.replace('/api', '');

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

                const rawSlides = Array.isArray(data) ? data : [];

                // ✅ Formatear rutas de imágenes
                const formattedData = rawSlides.map(slide => {
                    const imgPath = slide.image_url || slide.image || '';
                    return {
                        ...slide,
                        displayImage: imgPath.startsWith('/uploads')
                            ? `${BASE_URL}${imgPath}`
                            : imgPath
                    };
                });

                setSlides(formattedData.slice(0, 3));
            } catch (error) {
                console.error("Error cargando hero:", error);
                setSlides([
                    {
                        id: "fallback-1",
                        title: "Black Michi Studio",
                        subtitle: "Diseños exclusivos para gamers",
                        displayImage: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=800",
                        buttonText: "Explorar Colección"
                    }
                ]);
            } finally {
                setLoading(false);
            }
        };

        fetchHeroImages();
    }, []);

    if (loading) return <div className="h-[400px] animate-pulse bg-secondary/20 rounded-3xl m-8" />;

    return (
        <div className="w-full flex justify-center pt-0 px-4 sm:px-8">
            <div className="w-full max-w-[1800px] relative rounded-3xl overflow-hidden shadow-2xl border border-border">
                <Swiper
                    modules={[Navigation, Autoplay]}
                    navigation
                    autoplay={{ delay: 5000 }}
                    onSlideChange={(swiper) => setActiveIndex(swiper.realIndex)}
                    className="w-full"
                >
                    {slides.map((slide) => (
                        <SwiperSlide key={slide.id}>
                            <div className="relative h-[300px] sm:h-[460px] xl:h-[560px] overflow-hidden">
                                <div className="absolute inset-0 bg-cover bg-center opacity-20"
                                    style={{ backgroundImage: `url(${slide.displayImage})` }} />

                                <div className="relative z-10 h-full flex items-center px-6 md:px-24">
                                    <div className="grid grid-cols-1 lg:grid-cols-2 items-center w-full">
                                        <div className="space-y-6">
                                            <h1 className="text-4xl md:text-6xl font-bold text-foreground">{slide.title}</h1>
                                            <p className="text-xl text-muted-foreground">{slide.subtitle}</p>
                                            <button
                                                onClick={() => navigate("/productos")}
                                                className="px-8 py-4 bg-accent text-accent-foreground rounded-full flex items-center gap-2 hover:scale-105 transition-transform"
                                            >
                                                {slide.buttonText || "Ver más"} <ChevronRight />
                                            </button>
                                        </div>
                                        <div className="hidden lg:block">
                                            <img src={slide.displayImage} alt={slide.title} className="max-w-md mx-auto rounded-2xl shadow-2xl" />
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