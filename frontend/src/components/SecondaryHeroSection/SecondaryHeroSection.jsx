// SecondaryHeroSection.jsx
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Autoplay } from 'swiper/modules';
import { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import { MessageCircle, Sparkles, Headphones, Palette, ChevronRight } from 'lucide-react';
import api from "../../services/api";
import 'swiper/css';
import 'swiper/css/navigation';
import { getImageUrl } from "../../utils/getImageUrl";

export default function SecondaryHeroSection() {
  const navigate = useNavigate();
  const [slides, setSlides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);
  const [whatsappNumber] = useState("+56912345678");

  useEffect(() => {
    const fetchHeroProducts = async () => {
      try {
        setLoading(true);
        const { data } = await api.get("/hero-images/public");
        if (Array.isArray(data)) {
          const lastThree = data.slice(-3).map((item) => ({
            id: item.id || item._id || Math.random(),
            title: item.title || item.nombre || "",
            subtitle: item.subtitle || item.descripcion || "",
            image: item.image_url || item.image || item.imageUrl || item.imagen || "",
            categoria: item.categoria || item.category || "",
            button_text: item.button_text || item.buttonText || "Ver Colección"
          }));
          setSlides(lastThree.length > 0 ? lastThree : getDefaultSlides());
        } else {
          setSlides(getDefaultSlides());
        }
      } catch (error) {
        console.error("Error cargando hero:", error);
        setSlides(getDefaultSlides());
      } finally {
        setLoading(false);
      }
    };
    fetchHeroProducts();
  }, []);

  const handleWhatsAppClick = () => {
    const mensaje = "¡Hola Black Michi Studio! Me interesa solicitar un diseño personalizado. ¿Me podrían ayudar?";
    window.open(`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(mensaje)}`, '_blank');
  };

  if (loading) {
    return (
      <div className="w-full flex justify-center pt-0 px-4 sm:px-8 mb-16">
        <div className="w-full max-w-[1800px] grid grid-cols-1 lg:grid-cols-3 gap-6 items-end">
          <div className="lg:col-span-2 h-[380px] rounded-3xl border border-border bg-secondary/20 animate-pulse" />
          <div className="h-[380px] rounded-3xl border border-border bg-secondary/20 opacity-70" />
        </div>
      </div>
    );
  }

  return (
    <div className="w-full flex justify-center pt-0 px-4 sm:px-8 mb-16">
      <div className="w-full max-w-[1800px] grid grid-cols-1 lg:grid-cols-3 gap-6 items-end">

        {/* --- Carousel Principal (2/3) --- */}
        <div className="lg:col-span-2 relative rounded-3xl overflow-hidden shadow-2xl border border-border h-[380px]">
          <Swiper
            modules={[Navigation, Autoplay]}
            spaceBetween={0}
            slidesPerView={1}
            centeredSlides
            loop
            autoplay={{ delay: 6000, disableOnInteraction: false }}
            speed={800}
            onSlideChange={(swiper) => setActiveIndex(swiper.realIndex)}
            className="w-full h-full"
          >
            {slides.map(({ id, title, subtitle, image, button_text }, index) => (
              <SwiperSlide key={id}>
                <div className="relative h-[380px] overflow-hidden bg-background">

                  {/* Imagen de fondo difuminada — posicionada a la izquierda */}
                  <img
                    src={getImageUrl(image, 629, 412, 85)}
                    srcSet={`${getImageUrl(image, 400, 260, 80)} 400w, ${getImageUrl(image, 629, 412, 85)} 629w`}
                    sizes="(max-width: 640px) 400px, 629px"
                    alt=""
                    aria-hidden="true"
                    fetchPriority={index === 0 ? "high" : "auto"}
                    loading={index === 0 ? "eager" : "lazy"}
                    className="absolute inset-0 w-full h-full object-cover opacity-40 scale-110"
                    style={{ objectPosition: 'left center' }}
                  />

                  {/* Gradiente de derecha a izquierda — protege el texto de la derecha */}
                  <div className="absolute inset-0 bg-gradient-to-l from-background/90 via-background/40 to-transparent z-10" />

                  {/* Imagen principal — cubre todo el alto, pegada a la izquierda */}
                  <img
                    src={getImageUrl(image, 407, 380, 90)}
                    srcSet={`${getImageUrl(image, 300, 280, 85)} 300w, ${getImageUrl(image, 407, 380, 90)} 407w`}
                    sizes="(max-width: 640px) 300px, 407px"
                    alt={title}
                    fetchPriority={index === 0 ? "high" : "auto"}
                    loading={index === 0 ? "eager" : "lazy"}
                    className="absolute left-[8%] top-0 h-full w-auto object-contain z-20"
                  />

                  {/* Texto — derecha */}
                  <div className="relative z-30 h-full flex items-center justify-end">
                    <div className="w-full px-6 md:px-12 lg:px-20 xl:px-28 flex justify-end">
                      <div className="text-right space-y-4 md:space-y-6 max-w-lg">
                        <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold leading-tight">
                          <span className="bg-gradient-to-l from-foreground via-foreground/90 to-foreground/70 bg-clip-text text-transparent">
                            {title}
                          </span>
                        </h2>
                        <p className="text-base sm:text-lg md:text-xl text-muted-foreground font-light">
                          {subtitle}
                        </p>
                        <div className="pt-2 flex justify-end">
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

        {/* --- Sidebar Promocional (1/3) --- */}
        <div className="relative rounded-3xl border border-border shadow-2xl bg-gradient-to-b from-background via-secondary/5 to-background p-4 sm:p-6 flex flex-col justify-between h-[380px]">
          <div className="text-center mb-4 sm:mb-6">
            <h3 className="text-lg sm:text-xl font-bold text-foreground">
              ¿Quieres algo único?
            </h3>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1">
              Diseñamos productos personalizados solo para ti.
            </p>
          </div>

          <div className="space-y-3 sm:space-y-4 text-muted-foreground text-xs sm:text-sm mb-4 sm:mb-6">
            <p className="px-2 text-center">¿Tienes una idea en mente? ¡Hagámosla realidad!</p>
            <ul className="space-y-2 text-left">
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
              onClick={handleWhatsAppClick}
              className="px-4 sm:px-6 py-2.5 sm:py-3 bg-transparent text-[#25D366] font-bold rounded-full hover:shadow-xl hover:shadow-[#25D366]/30 hover:-translate-y-0.5 transition-all duration-300 border-2 border-[#25D366]/50 hover:border-[#25D366] inline-flex items-center justify-center gap-2 text-sm sm:text-base w-full sm:w-fit max-w-xs"
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
