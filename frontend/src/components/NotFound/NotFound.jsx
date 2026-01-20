// NotFound.jsx
import { Link } from "react-router-dom";

function NotFound() {
  return (
    <div className="text-center mt-20">
      <h1 className="text-4xl font-bold text-primary">404</h1>
      <p className="text-lg mt-2 text-foreground">Página no encontrada</p>
      <Link
        to="/"
        className="mt-6 inline-block bg-primary text-primary-foreground px-4 py-2 rounded hover:bg-primary/90 transition"
      >
        Volver al inicio
      </Link>
    </div>
  );
}

export default NotFound;