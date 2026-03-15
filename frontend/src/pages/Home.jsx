import HeroSection from "../components/HeroSection/HeroSection";
import CategoryCards from "../components/CategoryCards/CategoryCards";
import PopularProducts from "../components/PopularProducts/PopularProducts";
import SecondaryHeroSection from "../components/SecondaryHeroSection/SecondaryHeroSection";

function Home() {
  return (
    <div className="min-h-screen bg-background">
      <section className="relative w-full flex flex-col items-center justify-center bg-background bg-grid py-10 overflow-hidden">
        <div className="absolute inset-0 bg-background/70"></div>
        <div className="relative z-10 w-full">
          <HeroSection />
        </div>
      </section>

      <section className="relative w-full flex flex-col items-center justify-center bg-background bg-grid overflow-hidden">
        <CategoryCards />
      </section>

      <section className="w-full mb-10">
        <PopularProducts />
      </section>

      <section className="w-full mb-10">
        <SecondaryHeroSection />
      </section>
    </div>
  );
}

export default Home;