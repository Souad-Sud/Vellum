import Footer from "@/components/Footer";
import Header from "@/components/Header";
import { Cormorant_Garamond } from "next/font/google";

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  variable: "--font-cormorant",
  weight: ["300", "400", "500", "600", "700"],
});

const MainLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className={cormorant.className}>
      <Header />
      {children}
      <Footer />
    </div>
  );
};

export default MainLayout;
