import TopBanner from "../TopBanner/TopBanner";
import Header from "../Header/Header";
import Footer from "../Footer/Footer";
import { useLocation } from "react-router-dom";

function Layout({ children }) {
  const location = useLocation();
  const isLogin = location.pathname === "/login";

  return (
    <div className="min-h-screen font-sans bg-background">
      <div className="h-[40px]">
        {!isLogin && <TopBanner />}
      </div>
      {!isLogin && <Header />}
      <main className="bg-background min-h-screen">
        {children}
      </main>
      {!isLogin && <Footer />}
    </div>
  );
}

export default Layout;