// Footer.tsx
import { Link } from "react-router-dom";

function Footer() {
  return (
    <footer className="bg-background text-foreground py-10 mt-20 border-t border-border">
      <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">

        {/* Columna 1 - Logo y descripción */}
        <div>
          <h2 className="text-foreground text-2xl font-bold mb-4">blackmichiestudio</h2>
          <p className="text-sm text-muted">
            Impresiones 3D personalizadas de alta calidad. Envíos a todo el país.
          </p>
        </div>

        {/* Columna 2 - Navegación */}
        <nav aria-label="Navegación">
          <h3 className="text-foreground font-semibold mb-4">Navegación</h3>
          <ul className="space-y-2 text-sm">
            <li><Link to="/" className="hover:text-primary transition-colors">Inicio</Link></li>
            <li><Link to="/productos" className="hover:text-primary transition-colors">Productos</Link></li>
            <li><Link to="/contacto" className="hover:text-primary transition-colors">Contacto</Link></li>
          </ul>
        </nav>

        {/* Columna 3 - Ayuda */}
        <div>
          <h3 className="text-foreground font-semibold mb-4">Ayuda</h3>
          <ul className="space-y-2 text-sm">
            <li><Link to="/preguntas-frecuentes" className="hover:text-primary transition-colors">Preguntas Frecuentes</Link></li>
            <li><Link to="/terminos-y-condiciones" className="hover:text-primary transition-colors">Términos y Condiciones</Link></li>
            <li><Link to="/politica-privacidad" className="hover:text-primary transition-colors">Política de Privacidad</Link></li>
          </ul>
        </div>

        {/* Columna 4 - Redes sociales */}
        <div>
          <h3 className="text-foreground font-semibold mb-4">Síguenos</h3>
          <div className="flex gap-4">
            <a href="https://www.instagram.com/bmichi.7" target="_blank" rel="noopener noreferrer" className="hover:text-pink-400 transition-colors">Instagram</a>
          </div>
        </div>

      </div>

      {/* Línea inferior */}
      <div className="text-center text-xs text-muted mt-10 border-t border-border pt-6">
        © {new Date().getFullYear()} blackmichiestudio. Todos los derechos reservados.
      </div>
    </footer>
  );
}

export default Footer;
