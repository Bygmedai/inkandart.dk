import { Loader } from "@/components/emerge/Loader";
import { Header } from "@/components/emerge/Header";
import { Hero } from "@/components/emerge/Hero";
import { Legend } from "@/components/emerge/Legend";
import { Artists } from "@/components/emerge/Artists";
import { Work } from "@/components/emerge/Work";
import { Studio } from "@/components/emerge/Studio";
import { Booking } from "@/components/emerge/Booking";
import { Footer } from "@/components/emerge/Footer";
import { Seam } from "@/components/emerge/Seam";

/* Landskabet: zonerne støder ikke sammen — sømmene (blæk der opløses i begge
   retninger) trækker dem ind i hinanden, som rødderne der bliver til muld. */
export default function HomePage() {
  return (
    <>
      <Loader />
      <Header />
      <main id="main">
        <Hero />
        <Seam art="ink" opacity={0.55} />
        <Legend />
        <Seam art="bloom" flip opacity={0.4} overlap="clamp(-150px, -13svh, -70px)" />
        <Work />
        <Seam art="ink" flip opacity={0.5} />
        <Studio />
        <Seam art="skin" opacity={0.35} overlap="clamp(-150px, -13svh, -70px)" />
        <Artists />
        <Legend id="legend-late" />
        <Seam art="ink" opacity={0.45} overlap="clamp(-150px, -13svh, -70px)" />
        <Booking />
      </main>
      <Footer />
    </>
  );
}
