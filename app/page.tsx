import { Loader } from "@/components/emerge/Loader";
import { Header } from "@/components/emerge/Header";
import { Hero } from "@/components/emerge/Hero";
import { Legend } from "@/components/emerge/Legend";
import { Artists } from "@/components/emerge/Artists";
import { Work } from "@/components/emerge/Work";
import { Studio } from "@/components/emerge/Studio";
import { Booking } from "@/components/emerge/Booking";
import { Footer } from "@/components/emerge/Footer";

export default function HomePage() {
  return (
    <>
      <Loader />
      <Header />
      <main id="main">
        <Hero />
        <Legend />
        <Work />
        <Studio />
        <Artists />
        <Booking />
      </main>
      <Footer />
    </>
  );
}
