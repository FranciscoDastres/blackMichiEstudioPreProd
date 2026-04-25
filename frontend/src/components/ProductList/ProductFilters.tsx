import { useState } from "react";
import { ChevronDown, ChevronUp, SlidersHorizontal } from "lucide-react";

const CLP = new Intl.NumberFormat("es-CL", {
  style: "currency",
  currency: "CLP",
  maximumFractionDigits: 0,
});

interface StarIconProps {
  filled: boolean;
}

const StarIcon = ({ filled }: StarIconProps) => (
  <svg
    className={`w-4 h-4 ${filled ? "text-yellow-400 fill-yellow-400" : "text-muted fill-muted"}`}
    viewBox="0 0 24 24"
  >
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.16 12 17.77 5.82 21.16 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
);

interface Category {
  id: number;
  nombre: string;
}

interface ProductFiltersProps {
  categories: Category[];
  selectedCategoryId: number | null;
  onCategoryToggle: (cat: Category) => void;
  priceRange: [number, number];
  setPriceRange: (range: [number, number]) => void;
  maxPrice: number;
  selectedRating: number;
  setSelectedRating: (rating: number) => void;
  hasActiveFilters: boolean;
  onClearFilters: () => void;
}

export default function ProductFilters({
  categories,
  selectedCategoryId,
  onCategoryToggle,
  priceRange,
  setPriceRange,
  maxPrice,
  selectedRating,
  setSelectedRating,
  hasActiveFilters,
  onClearFilters,
}: ProductFiltersProps) {
  const [catOpen, setCatOpen] = useState(true);
  const [priceOpen, setPriceOpen] = useState(true);
  const [ratingOpen, setRatingOpen] = useState(true);

  return (
    <div className="space-y-6">
      {/* Categorías */}
      <div className="border border-border rounded-xl overflow-hidden">
        <button
          className="w-full flex items-center justify-between px-4 py-3 bg-background font-semibold text-foreground text-sm"
          onClick={() => setCatOpen((o) => !o)}
        >
          <span>Comprar por Categoría</span>
          {catOpen ? (
            <ChevronUp className="w-4 h-4" />
          ) : (
            <ChevronDown className="w-4 h-4" />
          )}
        </button>

        {catOpen && (
          <div className="px-4 pb-4 pt-2 space-y-2">
            {categories.map((cat) => (
              <label
                key={cat.id}
                className="flex items-center gap-2.5 cursor-pointer group"
              >
                <input
                  type="checkbox"
                  checked={selectedCategoryId === cat.id}
                  onChange={() => onCategoryToggle(cat)}
                  className="w-4 h-4 rounded border-border accent-primary cursor-pointer"
                />
                <span className="text-sm text-foreground group-hover:text-primary transition-colors">
                  {cat.nombre}
                </span>
              </label>
            ))}
            {categories.length === 0 && (
              <p className="text-xs text-muted">Sin categorías</p>
            )}
          </div>
        )}
      </div>

      {/* Precio */}
      <div className="border border-border rounded-xl overflow-hidden">
        <button
          className="w-full flex items-center justify-between px-4 py-3 bg-background font-semibold text-foreground text-sm"
          onClick={() => setPriceOpen((o) => !o)}
        >
          <span>Filtrar por Precio</span>
          {priceOpen ? (
            <ChevronUp className="w-4 h-4" />
          ) : (
            <ChevronDown className="w-4 h-4" />
          )}
        </button>

        {priceOpen && (
          <div className="px-4 pb-4 pt-2 space-y-3">
            <div className="flex items-center justify-between text-xs text-muted">
              <span>{CLP.format(priceRange[0])}</span>
              <span>{CLP.format(priceRange[1])}</span>
            </div>

            <div className="relative">
              <input
                type="range"
                min={0}
                max={maxPrice}
                step={1000}
                value={priceRange[0]}
                onChange={(e) => {
                  const v = Number(e.target.value);
                  if (v <= priceRange[1]) setPriceRange([v, priceRange[1]]);
                }}
                className="w-full h-1.5 appearance-none rounded-full bg-border cursor-pointer accent-primary"
              />
              <input
                type="range"
                min={0}
                max={maxPrice}
                step={1000}
                value={priceRange[1]}
                onChange={(e) => {
                  const v = Number(e.target.value);
                  if (v >= priceRange[0]) setPriceRange([priceRange[0], v]);
                }}
                className="w-full h-1.5 appearance-none rounded-full bg-border cursor-pointer accent-primary mt-2"
              />
            </div>

            <div className="flex gap-2">
              <div className="flex-1">
                <label className="text-xs text-muted block mb-1">Mín</label>
                <input
                  type="number"
                  min={0}
                  max={priceRange[1]}
                  step={1000}
                  value={priceRange[0]}
                  onChange={(e) => {
                    const v = Math.min(Number(e.target.value), priceRange[1]);
                    setPriceRange([v, priceRange[1]]);
                  }}
                  className="w-full text-xs border border-border rounded-lg px-2 py-1.5 bg-background text-foreground focus:outline-none focus:border-primary"
                />
              </div>
              <div className="flex-1">
                <label className="text-xs text-muted block mb-1">Máx</label>
                <input
                  type="number"
                  min={priceRange[0]}
                  max={maxPrice}
                  step={1000}
                  value={priceRange[1]}
                  onChange={(e) => {
                    const v = Math.max(Number(e.target.value), priceRange[0]);
                    setPriceRange([priceRange[0], v]);
                  }}
                  className="w-full text-xs border border-border rounded-lg px-2 py-1.5 bg-background text-foreground focus:outline-none focus:border-primary"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Calificación */}
      <div className="border border-border rounded-xl overflow-hidden">
        <button
          className="w-full flex items-center justify-between px-4 py-3 bg-background font-semibold text-foreground text-sm"
          onClick={() => setRatingOpen((o) => !o)}
        >
          <span>Filtrar por Calificación</span>
          {ratingOpen ? (
            <ChevronUp className="w-4 h-4" />
          ) : (
            <ChevronDown className="w-4 h-4" />
          )}
        </button>

        {ratingOpen && (
          <div className="px-4 pb-4 pt-2 space-y-2">
            {[5, 4, 3, 2, 1].map((stars) => (
              <label
                key={stars}
                className="flex items-center gap-2.5 cursor-pointer group"
              >
                <input
                  type="checkbox"
                  checked={selectedRating === stars}
                  onChange={() =>
                    setSelectedRating(selectedRating === stars ? 0 : stars)
                  }
                  className="w-4 h-4 rounded border-border accent-primary cursor-pointer"
                />
                <div className="flex items-center gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <StarIcon key={i} filled={i < stars} />
                  ))}
                </div>
              </label>
            ))}
          </div>
        )}
      </div>

      {hasActiveFilters && (
        <button
          onClick={onClearFilters}
          className="w-full flex items-center justify-center gap-2 text-sm text-muted hover:text-primary border border-border rounded-xl py-2 transition-colors"
        >
          <SlidersHorizontal className="w-4 h-4" />
          Limpiar filtros
        </button>
      )}
    </div>
  );
}
