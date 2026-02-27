import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Autoplay } from 'swiper/modules';
import { useState } from 'react';
import { useNavigate } from "react-router-dom";
import { MessageCircle, Tag, Palette, Sparkles, Headphones } from 'lucide-react';
import 'swiper/css';
import 'swiper/css/navigation';

const LOCAL_SLIDES = [
  {
    id: "1",
    title: "Círculo con Triángulos",
    subtitle: "Figuras geométricas únicas para decorar tu espacio",
    image: "/uploads/hero/hero_cirtculo_con_triangulos.jpg",
    categoria: "Figuras",
    buttonText: "Ver Colección"
  },
  {
    id: "2",
    title: "Porta Huevos",
    subtitle: "Diseños funcionales y originales para tu cocina",
    image: "/uploads/hero/hero_porta_huevos.jpg",
    categoria: "Accesorios",
    buttonText: "Ver Colección"
  },
  {
    id: "3",
    title: "Cajitas Minecraft",
    subtitle: "Para los fanáticos del juego más popular del mundo",
    image: "/uploads/hero/hero_cajitas_minecraft.jpg",
    categoria: "Gaming",
    buttonText: "Ver Colección"
  }
];

export default function SecondaryHeroSection() {
  const navigate = useNavigate();
  const [activeIndex, setActiveIndex] = useState(0);
  const [whatsappNumber] = useState("+56912345678");

  const handleWhatsAppClick = (producto = null) => {
    let mensaje = "¡Hola Black Michi Studio! Me interesa ";
    if (producto) {
      mensaje += `el producto "${producto.title}" que vi en su página. ¿Podrían darme más información?`;
    } else {
      mensaje += "solicitar un diseño personalizado. ¿Me podrían ayudar?";
    }
    window.open(`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(mensaje)}`, '_blank');
  };

  const handleImageClick = () => {
    navigate('/productos');
  };

  return (
    <div className="w-full flex justify-center pt-0 px-4 sm:px-8 mb-16">
      <div className="w-full max-w-[1800px] grid grid-cols-1 lg:grid-cols-3 gap-6 items-end">

        {/* --- Carousel Principal (2/3) --- */}
        <div className="lg:col-span-2 relative rounded-3xl overflow-hidden shadow-2xl border border-border bg-gradient-to-br from-background via-secondary/5 to-background h-[380px]">
          <Swiper
            modules={[Navigation, Autoplay]}
            spaceBetween={0}
            slidesPerView={1}
            centeredSlides
            loop
            navigation
            autoplay={{ delay: 6000, disableOnInteraction: false }}
            speed={800}
            onSlideChange={(swiper) => setActiveIndex(swiper.realIndex)}
            className="w-full h-full"
          >
            {LOCAL_SLIDES.map((slide, idx) => (
              <SwiperSlide key={`${slide.id}-${idx}`} className="h-full">
                <div className="relative w-full h-full overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-background via-background/95 to-background/90 z-0"></div>
                  <div
                    className="absolute inset-0 z-0 bg-cover bg-center opacity-30"
                    style={{ backgroundImage: `url(${slide.image})` }}
                  ></div>

                  <div className="relative z-10 h-full flex items-center px-4 sm:px-6 md:px-12">
                    <div className="w-full max-w-6xl grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 md:gap-8 items-center">

                      {/* Imagen */}
                      <div
                        className="relative group order-1 md:order-1 flex justify-center md:justify-end cursor-pointer"
                        onClick={handleImageClick}
                      >
                        <div className="w-full max-w-[220px] sm:max-w-[260px] md:max-w-[320px] lg:max-w-[380px] aspect-square flex items-center justify-center">
                          <img
                            src={slide.image}
                            alt={slide.title}
                            className="w-full h-full object-cover object-center rounded-lg sm:rounded-xl shadow-lg sm:shadow-2xl transform transition-transform duration-500 group-hover:scale-105"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=800&auto=format&fit=crop";
                            }}
                            draggable={false}
                          />
                        </div>
                      </div>

                      {/* Texto */}
                      <div className="text-left space-y-2 sm:space-y-3 md:space-y-4 order-2 md:order-2 flex flex-col h-full pb-8 md:pb-8 md:pl-4 lg:pl-8">
                        {slide.categoria && (
                          <div className="inline-flex items-center gap-1 sm:gap-1.5 px-3 sm:px-4 py-1 sm:py-2 bg-secondary/80 text-secondary-foreground rounded-full text-xs sm:text-sm font-medium w-fit">
                            <Tag className="w-3 sm:w-4 h-3 sm:h-4" /> {slide.categoria}
                          </div>
                        )}
                        <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-foreground leading-tight">
                          {slide.title}
                        </h2>
                        <p className="text-sm sm:text-base md:text-lg text-muted-foreground leading-relaxed">
                          {slide.subtitle}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Indicadores */}
                  <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-20">
                    <div className="flex gap-1.5 bg-black/20 backdrop-blur-sm px-3 py-1.5 rounded-full">
                      {LOCAL_SLIDES.map((_, i) => (
                        <button
                          key={i}
                          onClick={() => document.querySelector('.swiper')?.swiper.slideToLoop(i)}
                          className={`w-2 h-2 rounded-full transition-all ${activeIndex === i ? 'bg-accent' : 'bg-white/60'}`}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>

        {/* --- Sidebar Promocional (1/3) --- */}
        <div className="relative rounded-3xl border border-border shadow-2xl bg-gradient-to-b from-background via-secondary/5 to-background p-4 sm:p-6 flex flex-col justify-between min-h-[260px] sm:min-h-[320px] lg:h-[380px]">
          <div className="text-center mb-4 sm:mb-6">
            <h3 className="text-lg sm:text-xl font-bold text-foreground">
              ¿Quieres algo único?
            </h3>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1">
              Diseñamos productos personalizados solo para ti.
            </p>
          </div>

          <div className="space-y-3 sm:space-y-4 text-center text-muted-foreground text-xs sm:text-sm mb-4 sm:mb-6">
            <p className="px-2">¿Tienes una idea en mente? ¡Hagámosla realidad!</p>
            <ul className="space-y-2 text-left text-xs sm:text-sm">
              <li className="flex items-start gap-2">
                <Sparkles className="w-4 h-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                <span>Diseño 100% personalizado</span>
              </li>
              <li className="flex items-start gap-2">
                <Headphones className="w-4 h-4 text-accent mt-0.5 flex-shrink-0" />
                <span>Asesoría directa con el equipo</span>
              </li>
              <li className="flex items-start gap-2">
                <Palette className="w-4 h-4 text-sky-500 mt-0.5 flex-shrink-0" />
                <span>Materiales premium y acabados únicos</span>
              </li>
            </ul>
          </div>

          <p className="text-[10px] sm:text-xs text-center text-muted-foreground mb-3">
            Horario de 9:00 a 18:00 hrs. Respuesta en menos de 24 hrs.
          </p>

          <div className="flex justify-center mt-auto">
            <button
              onClick={() => handleWhatsAppClick()}
              className="px-4 sm:px-6 py-2.5 sm:py-3 bg-transparent text-[#25D366] font-bold rounded-full hover:shadow-xl hover:shadow-[#25D366]/30 hover:-translate-y-0.5 transition-all duration-300 border-2 border-[#25D366]/50 hover:border-[#25D366] inline-flex items-center justify-center gap-2 text-sm sm:text-base leading-none w-full xs:w-auto sm:w-fit max-w-xs"
            >
              <MessageCircle className="w-4 h-4 sm:w-5 sm:h-5" />
              Consultar por WhatsApp
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}