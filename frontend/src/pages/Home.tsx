import HeroSection from "../components/HeroSection/HeroSection";
import PopularProducts from "../components/PopularProducts/PopularProducts";
import SecondaryHeroSection from "../components/SecondaryHeroSection/SecondaryHeroSection";
import Newsletter from "../components/Newsletter/Newsletter";
import useSEO from "../hooks/useSEO";

function Home() {
  const seo = useSEO({
    title: "Figuras 3D Personalizadas",
    description: "Black Michi Estudio — Figuras impresas en 3D, coleccionables únicos y decoraciones personalizadas. Envíos a todo Chile.",
    path: "/",
  });
  return (
    <>{seo}<div className="min-h-screen bg-background">
      <section className="relative w-full flex flex-col items-center justify-center bg-background bg-grid py-10 overflow-hidden">
        <div className="absolute inset-0 bg-background/70"></div>
        <div className="relative z-10 w-full">
          <HeroSection />
        </div>
      </section>

      <section className="w-full mb-10">
        <PopularProducts />
      </section>

      <section className="w-full mb-10">
        <SecondaryHeroSection />
      </section>

      <section className="w-full">
        <Newsletter />
      </section>
    </div></>
  );
}

export default Home;
