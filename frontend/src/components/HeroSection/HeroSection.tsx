import { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import { getImageUrl } from "../../utils/getImageUrl";
import { ChevronRight } from 'lucide-react';

interface Slide {
  id: string | number;
  title: string;
  subtitle: string;
  image_url: string;
  categoria?: string;
  button_text?: string;
}

// URL sin versión → Cloudinary siempre sirve la más reciente y coincide con el preload de index.html
const FALLBACK_SLIDES: Slide[] = [
  {
    id: "1",
    title: "Black Michi Studio",
    subtitle: "Diseños exclusivos para gamers",
    image_url: "https://res.cloudinary.com/dp89agr1s/image/upload/blackmichi/hero/section1.webp",
    categoria: "all",
    button_text: "Explorar Colección"
  },
  {
    id: "2",
    title: "Soportes Personalizados",
    subtitle: "Arte y funcionalidad en cada diseño",
    image_url: "https://res.cloudinary.com/dp89agr1s/image/upload/blackmichi/hero/section1.webp",
    categoria: "soportes",
    button_text: "Ver Soportes"
  },
  {
    id: "3",
    title: "Figuras Únicas",
    subtitle: "Elaboradas completamente a mano",
    image_url: "https://res.cloudinary.com/dp89agr1s/image/upload/blackmichi/hero/section1.webp",
    categoria: "figuras",
    button_text: "Ver Figuras"
  }
];

export default function HeroSection() {
  const navigate = useNavigate();
  const [slides, setSlides] = useState<Slide[]>(FALLBACK_SLIDES);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      api.get<Slide[]>("/hero-images/public")
        .then(({ data }) => {
          const allSlides = Array.isArray(data) ? data.slice(0, 3) : [];
          if (allSlides.length) {
            setSlides(allSlides);
            setActiveIndex(0);
          }
        })
        .catch(() => { /* fallback already rendered */ });
    }, 1200);

    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (slides.length <= 1) return;

    const timer = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % slides.length);
    }, 5000);

    return () => window.clearInterval(timer);
  }, [slides.length]);

  const currentSlide = slides[activeIndex] || slides[0];
  const { title, subtitle, image_url, button_text = "Explorar Colección" } = currentSlide;

  return (
    <div className="w-full flex justify-center pt-0 px-4 sm:px-8">
      <div className="w-full max-w-[1800px] relative rounded-3xl overflow-hidden shadow-2xl border border-border h-[300px] sm:h-[380px] md:h-[460px] xl:h-[560px]">
        <div className="relative h-[300px] sm:h-[380px] md:h-[460px] xl:h-[560px] overflow-hidden bg-background">

          <img
            src={getImageUrl(image_url, 629, 412, 60, "fill")}
            srcSet={`${getImageUrl(image_url, 400, 260, 60, "fill")} 400w, ${getImageUrl(image_url, 629, 412, 60, "fill")} 629w, ${getImageUrl(image_url, 900, 590, 60, "fill")} 900w`}
            sizes="(max-width: 640px) 400px, (max-width: 1024px) 629px, 900px"
            alt=""
            aria-hidden="true"
            fetchPriority="high"
            loading="eager"
            decoding="async"
            className="absolute inset-0 w-full h-full object-cover opacity-60 scale-110"
            style={{ objectPosition: 'right center' }}
          />

          <div className="absolute inset-0 bg-gradient-to-r from-background/90 via-background/40 to-transparent z-10" />

          <img
            src={getImageUrl(image_url, 407, 380, 90)}
            srcSet={`${getImageUrl(image_url, 300, 280, 85)} 300w, ${getImageUrl(image_url, 407, 380, 90)} 407w, ${getImageUrl(image_url, 560, 520, 90)} 560w`}
            sizes="(max-width: 640px) 300px, (max-width: 1024px) 407px, 560px"
            alt={title}
            fetchPriority="auto"
            loading="eager"
            decoding="async"
            className="hidden sm:block absolute right-[8%] top-0 h-full w-auto object-contain z-20"
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
                    className="group inline-flex items-center gap-2 px-6 py-3 bg-sky-700 text-white font-semibold rounded-full border-2 border-sky-400/50 hover:border-sky-400 shadow-[0_0_15px_rgba(56,189,248,0.2)] hover:shadow-[0_0_25px_rgba(56,189,248,0.5)] hover:-translate-y-0.5 transition-all duration-300"
                  >
                    <span className="text-sm">{button_text}</span>
                    <ChevronRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30">
            <div className="flex items-center gap-1">
              {slides.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveIndex(idx)}
                  className="p-3 flex items-center justify-center"
                  aria-label={`Ir al slide ${idx + 1}`}
                >
                  <span className={`block w-2.5 h-2.5 rounded-full transition-colors duration-300 ${activeIndex === idx
                    ? 'bg-foreground'
                    : 'bg-foreground/30'
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
