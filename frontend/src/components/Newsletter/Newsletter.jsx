import { useState } from "react";
import { Mail, ArrowRight, Check } from "lucide-react";

function Newsletter() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("idle"); // idle | loading | success | error

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email || !email.includes("@")) return;

    setStatus("loading");

    // Simulado — reemplazar con llamada real a API
    setTimeout(() => {
      setStatus("success");
      setEmail("");
    }, 800);
  };

  return (
    <section className="relative overflow-hidden bg-[hsl(220_20%_10%)]">
      <div className="absolute inset-0 bg-gradient-to-r from-[hsl(215_40%_15%)] via-[hsl(220_20%_10%)] to-[hsl(215_40%_15%)]" />

      <div className="relative max-w-4xl mx-auto px-4 py-16 text-center">
        <div className="w-14 h-14 bg-primary/10 border border-primary/20 rounded-xl flex items-center justify-center mx-auto mb-6">
          <Mail className="w-7 h-7 text-primary" />
        </div>

        <h2 className="text-2xl md:text-3xl font-extrabold text-foreground mb-3">
          No te pierdas nada
        </h2>
        <p className="text-muted max-w-md mx-auto mb-8">
          Recibe novedades, lanzamientos exclusivos y descuentos directamente en
          tu correo.
        </p>

        {status === "success" ? (
          <div className="inline-flex items-center gap-2 bg-green-500/10 border border-green-500/20 text-green-400 px-6 py-3 rounded-lg">
            <Check className="w-5 h-5" />
            <span className="font-medium">Suscrito correctamente</span>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto"
          >
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@email.com"
              required
              className="flex-1 px-4 py-3 bg-background border border-border rounded-lg text-foreground placeholder:text-muted focus:outline-none focus:border-primary transition-colors"
            />
            <button
              type="submit"
              disabled={status === "loading"}
              className="inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-lg font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              {status === "loading" ? (
                <div className="w-5 h-5 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  Suscribirse
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        )}

        <p className="text-sm text-muted mt-4">
          Sin spam. Puedes darte de baja en cualquier momento.
        </p>
      </div>
    </section>
  );
}

export default Newsletter;