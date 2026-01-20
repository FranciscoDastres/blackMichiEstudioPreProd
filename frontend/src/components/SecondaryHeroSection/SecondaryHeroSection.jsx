import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Autoplay } from 'swiper/modules';
import { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import { MessageCircle, Tag, Palette, Sparkles, Headphones } from 'lucide-react';
import api from "../../api/axios";
import 'swiper/css';
import 'swiper/css/navigation';

// ✅ URL de Render para limpiar los localhost
const RENDER_BACKEND = "https://blackmichi-backend-latest.onrender.com";

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
          // Tomamos las últimas 3 imágenes (4, 5 y 6)
          const lastThree = data.slice(-3).map((item) => {
            const rawPath = item.image || item.image_url || item.imageUrl || "";

            // --- LÓGICA DE LIMPIEZA DE URL ---
            let cleanPath = rawPath.replace(/^http:\/\/localhost:\d+/, '');
            cleanPath = cleanPath.replace(/^\/api/, '');
            if (!cleanPath.startsWith('/') && !cleanPath.startsWith('http')) {
              cleanPath = `/${cleanPath}`;
            }
            const finalImage = cleanPath.startsWith('http')
              ? cleanPath
              : `${RENDER_BACKEND}${cleanPath}`;
            // --------------------------------

            return {
              id: item.id || item._id || Math.random(),
              title: item.title || item.nombre || "",
              subtitle: item.subtitle || item.descripcion || "",
              image: finalImage,
              categoria: item.categoria || item.category || "",
              precio: item.precio || 0,
              stock: item.stock || 0,
              buttonText: item.buttonText || "Ver Colección"
            };
          });

          setSlides(lastThree.length > 0 ? lastThree : getDefaultSlides());
        } else {
          setSlides(getDefaultSlides());
        }
      } catch (error) {
        console.error("Error cargando secondary hero:", error);
        setSlides(getDefaultSlides());
      } finally {
        setLoading(false);
      }
    };

    fetchHeroProducts();
  }, []);

  const getDefaultSlides = () => [
    {
      id: "1",
      title: "Vasos Térmicos Personalizados",
      subtitle: "Mantén tus bebidas frías o calientes por horas con diseños únicos",
      image: "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=800",
      categoria: "Vasos Térmicos",
      stock: 10
    }
  ];

  const handleWhatsAppClick = () => {
    const mensaje = encodeURIComponent("¡Hola Black Michi Studio! Me interesa solicitar un diseño personalizado. ¿Me podrían ayudar?");
    window.open(`https://wa.me/${whatsappNumber}?text=${mensaje}`, '_blank');
  };

  if (loading) {
    return (
      <div className="w-full flex justify-center pt-0 px-4 sm:px-8 mb-12">
        <div className="w-full max-w-[1800px] grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-secondary/20 border border-border rounded-3xl animate-pulse h-[380px]"></div>
          <div className="bg-secondary/20 border border-border rounded-3xl animate-pulse h-[380px]"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full flex justify-center pt-0 px-4 sm:px-8 mb-16">
      <div className="w-full max-w-[1800px] grid grid-cols-1 lg:grid-cols-3 gap-6 items-end">

        {/* Carousel Principal */}
        <div className="lg:col-span-2 relative rounded-3xl overflow-hidden shadow-2xl border border-border bg-gradient-to-br from-background via-secondary/5 to-background h-[380px]">
          <Swiper
            modules={[Navigation, Autoplay]}
            spaceBetween={0}
            slidesPerView={1}
            loop
            navigation
            autoplay={{ delay: 6000, disableOnInteraction: false }}
            onSlideChange={(swiper) => setActiveIndex(swiper.realIndex)}
            className="w-full h-full"
          >
            {slides.map((slide, idx) => (
              <SwiperSlide key={`${slide.id}-${idx}`}>
                <div className="relative w-full h-full overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-background via-background/95 to-background/90 z-10"></div>
                  <div
                    className="absolute inset-0 z-0 bg-cover bg-center opacity-30"
                    style={{ backgroundImage: `url(${slide.image})` }}
                  ></div>

                  <div className="relative z-20 h-full flex items-center px-4 md:px-12">
                    <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-8 items-center">

                      {/* Imagen con stock */}
                      <div className="relative group flex justify-center md:justify-end cursor-pointer" onClick={() => navigate('/productos')}>
                        <div className="w-full max-w-[320px] aspect-square">
                          <img
                            src={slide.image}
                            alt={slide.title}
                            className="w-full h-full object-cover rounded-xl shadow-2xl transition-transform duration-500 group-hover:scale-105"
                            onError={(e) => { e.target.src = "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=800"; }}
                          />
                        </div>
                        {slide.stock > 0 && (
                          <div className="absolute -top-2 -right-2 z-30">
                            <div className={`px-3 py-1 text-white text-xs font-bold rounded-full shadow-lg ${slide.stock <= 5 ? 'bg-red-500' : 'bg-green-500'}`}>
                              {slide.stock <= 5 ? `¡Solo ${slide.stock}!` : "En stock"}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Texto */}
                      <div className="text-left space-y-4">
                        {slide.categoria && (
                          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-secondary/80 text-secondary-foreground rounded-full text-xs font-medium w-fit">
                            <Tag className="w-3 h-3" /> {slide.categoria}
                          </div>
                        )}
                        <h2 className="text-2xl md:text-4xl font-bold text-foreground leading-tight">{slide.title}</h2>
                        <p className="text-sm md:text-base text-muted-foreground leading-relaxed">{slide.subtitle}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>

        {/* Sidebar Promocional */}
        <div className="relative rounded-3xl border border-border shadow-2xl bg-gradient-to-b from-background via-secondary/5 to-background p-6 flex flex-col justify-between min-h-[380px] lg:h-[380px]">
          <div className="text-center">
            <h3 className="text-xl font-bold text-foreground">¿Quieres algo único?</h3>
            <p className="text-sm text-muted-foreground mt-1">Diseñamos productos personalizados solo para ti.</p>
          </div>

          <div className="space-y-4 text-muted-foreground text-sm">
            <ul className="space-y-3">
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

          <div className="flex flex-col items-center gap-4">
            <p className="text-[10px] text-muted-foreground">Horario de 9:00 a 18:00 hrs. Respuesta rápida.</p>
            <button
              onClick={handleWhatsAppClick}
              className="flex items-center justify-center gap-2 w-full px-5 py-3 font-semibold text-[#25D366] border-2 border-[#25D366]/60 rounded-full transition-all hover:bg-[#25D366]/10 hover:border-[#25D366] hover:shadow-lg hover:shadow-[#25D366]/30 active:scale-95"
            >
              <MessageCircle className="w-5 h-5" />
              Consultar por WhatsApp
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}