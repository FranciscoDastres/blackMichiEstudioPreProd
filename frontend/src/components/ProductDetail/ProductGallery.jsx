import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function ProductGallery({ images, titulo }) {
  const [selectedImgIndex, setSelectedImgIndex] = useState(0);
  const [zoomPosition, setZoomPosition] = useState({ x: 50, y: 50 });
  const [isZoomed, setIsZoomed] = useState(false);

  const mainImage = images[selectedImgIndex] || "/placeholder.svg";

  const handleImageZoom = (e) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setZoomPosition({ x, y });
  };

  const prev = () =>
    setSelectedImgIndex((i) => (i > 0 ? i - 1 : images.length - 1));
  const next = () =>
    setSelectedImgIndex((i) => (i < images.length - 1 ? i + 1 : 0));

  return (
    <div className="space-y-4">
      {/* Imagen principal */}
      <div
        className="relative overflow-hidden rounded-xl bg-secondary/30 aspect-square group"
        onMouseMove={handleImageZoom}
        onMouseEnter={() => setIsZoomed(true)}
        onMouseLeave={() => setIsZoomed(false)}
      >
        <img
          src={mainImage}
          alt={titulo || "Producto"}
          width="800"
          height="800"
          loading="eager"
          className={`w-full h-full object-contain transition-transform duration-300 ${
            isZoomed ? "scale-150" : ""
          }`}
          style={{
            transformOrigin: `${zoomPosition.x}% ${zoomPosition.y}%`,
          }}
          onError={(e) => {
            e.target.src = "/placeholder.svg";
          }}
        />
        {isZoomed && (
          <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-transparent to-black/10"></div>
        )}
      </div>

      {/* Miniaturas */}
      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-2">
          {images.map((img, index) => (
            <button
              key={index}
              onClick={() => setSelectedImgIndex(index)}
              className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all duration-300 ${
                selectedImgIndex === index
                  ? "border-primary shadow-lg shadow-primary/20 scale-105"
                  : "border-border hover:border-muted/50"
              }`}
              aria-label={`Ver imagen ${index + 1}`}
            >
              <img
                src={img}
                alt={`${titulo} ${index + 1}`}
                width="160"
                height="160"
                loading="lazy"
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      )}

      {/* Navegación */}
      {images.length > 1 && (
        <div className="flex items-center justify-center gap-4">
          <button
            onClick={prev}
            className="p-2 rounded-full bg-secondary/50 border border-border hover:bg-secondary transition-colors"
            aria-label="Imagen anterior"
          >
            <ChevronLeft className="w-5 h-5 text-foreground" />
          </button>
          <span className="text-sm text-muted">
            {selectedImgIndex + 1} / {images.length}
          </span>
          <button
            onClick={next}
            className="p-2 rounded-full bg-secondary/50 border border-border hover:bg-secondary transition-colors"
            aria-label="Siguiente imagen"
          >
            <ChevronRight className="w-5 h-5 text-foreground" />
          </button>
        </div>
      )}
    </div>
  );
}
