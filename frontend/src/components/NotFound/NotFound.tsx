// NotFound.tsx
import { Link, useNavigate } from "react-router-dom";
import { Home, ArrowLeft, Search, ShoppingBag } from "lucide-react";
import useSEO from "../../hooks/useSEO";

function NotFound() {
  const navigate = useNavigate();

  const seo = useSEO({
    title: "Página no encontrada",
    description: "La página que buscas no existe o fue movida.",
  });

  return (
    <>{seo}<div className="min-h-screen flex items-center justify-center bg-background px-4 py-12 relative overflow-hidden">
      {/* Glow background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-2xl w-full text-center">
        {/* 404 huge */}
        <h1 className="text-[8rem] md:text-[12rem] font-black leading-none bg-gradient-to-b from-primary via-primary/70 to-transparent bg-clip-text text-transparent select-none mb-6">
          404
        </h1>

        <div className="-mt-6 md:-mt-10 mb-6">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-3">
            Esta página se perdió en el multiverso
          </h2>
          <p className="text-muted max-w-md mx-auto">
            La URL que intentaste visitar no existe o fue movida.
            Pero tranquilo, aún tenemos muchas figuras esperándote.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center items-center mb-10">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 border border-border text-foreground px-5 py-3 rounded-lg hover:bg-background/60 transition w-full sm:w-auto justify-center"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver atrás
          </button>
          <Link
            to="/"
            className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-lg hover:bg-primary/90 transition w-full sm:w-auto justify-center font-semibold"
          >
            <Home className="w-4 h-4" />
            Ir al inicio
          </Link>
          <Link
            to="/productos"
            className="inline-flex items-center gap-2 border border-border text-foreground px-5 py-3 rounded-lg hover:bg-background/60 transition w-full sm:w-auto justify-center"
          >
            <ShoppingBag className="w-4 h-4" />
            Ver productos
          </Link>
        </div>

        {/* Quick links */}
        <div className="border-t border-border/50 pt-6">
          <p className="text-xs uppercase tracking-wider text-muted mb-3">
            Enlaces rápidos
          </p>
          <div className="flex flex-wrap gap-2 justify-center text-sm">
            <Link
              to="/productos"
              className="text-primary hover:underline inline-flex items-center gap-1"
            >
              <Search className="w-3 h-3" /> Catálogo
            </Link>
            <span className="text-muted">·</span>
            <Link to="/carrito" className="text-primary hover:underline">
              Mi carrito
            </Link>
            <span className="text-muted">·</span>
            <Link to="/login" className="text-primary hover:underline">
              Iniciar sesión
            </Link>
          </div>
        </div>
      </div>
    </div></>
  );
}

export default NotFound;
