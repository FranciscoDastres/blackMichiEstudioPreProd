import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Autoplay } from 'swiper/modules';
import { useState } from 'react';
import 'swiper/css';
import 'swiper/css/navigation';
import { useNavigate } from "react-router-dom";
import { ChevronRight } from 'lucide-react';

const LOCAL_SLIDES = [
    {
        id: "1",
        title: "Bender Chulo",
        subtitle: "Figuras creativas y originales para tu colección",
        image: "/uploads/hero/hero_bender_Chulo.jpg",
        categoria: "all",
        buttonText: "Explorar Colección"
    },
    {
        id: "2",
        title: "Pareja de Gatitos",
        subtitle: "Figuras únicas elaboradas a mano",
        image: "/uploads/hero/hero_pareja_gatitos.jpg",
        categoria: "figuras",
        buttonText: "Ver Figuras"
    },
    {
        id: "3",
        title: "Soporte Patricio Estrella",
        subtitle: "Arte y funcionalidad en cada diseño",
        image: "/uploads/hero/hero_soporte_Patricio.jpg",
        categoria: "soportes",
        buttonText: "Ver Soportes"
    }
];

export default function HeroSection() {
    const navigate = useNavigate();
    const [activeIndex, setActiveIndex] = useState(0);

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
                    {LOCAL_SLIDES.map(({ id, title, subtitle, image, buttonText }) => (
                        <SwiperSlide key={id}>
                            <div className="relative h-[300px] sm:h-[380px] md:h-[460px] xl:h-[560px] overflow-hidden">
                                {/* Fondo con gradiente */}
                                <div className="absolute inset-0 bg-gradient-to-br from-background via-secondary/20 to-background z-0"></div>

                                {/* Imagen de fondo con overlay */}
                                <div
                                    className="absolute inset-0 z-0 bg-cover bg-center opacity-20"
                                    style={{ backgroundImage: `url(${image})` }}
                                ></div>

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
                                                        <span className="relative z-10">{buttonText}</span>
                                                        <ChevronRight className="relative z-10 w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" />
                                                        <div className="absolute inset-0 bg-gradient-to-r from-sky-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                                        <div className="absolute inset-0 bg-accent/90 opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-0"></div>
                                                    </button>
                                                </div>
                                            </div>

                                            {/* Imagen principal */}
                                            <div className="relative hidden lg:block">
                                                <div className="relative">
                                                    <div className="absolute -inset-4 bg-gradient-to-r from-accent/10 to-accent/5 blur-3xl rounded-full"></div>
                                                    <img
                                                        src={image}
                                                        alt={title}
                                                        className="relative w-full max-w-2xl mx-auto rounded-2xl shadow-2xl transform transition-transform duration-700 hover:scale-105"
                                                    />
                                                    <div className="absolute -top-10 -right-10 w-40 h-40 bg-gradient-to-r from-accent/20 to-transparent rounded-full blur-2xl"></div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Puntos de navegación */}
                                <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20">
                                    <div className="flex items-center gap-2">
                                        {LOCAL_SLIDES.map((_, idx) => (
                                            <button
                                                key={idx}
                                                onClick={() => {
                                                    const swiper = document.querySelector('.swiper')?.swiper;
                                                    if (swiper) swiper.slideToLoop(idx);
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