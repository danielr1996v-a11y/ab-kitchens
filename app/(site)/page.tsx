import Hero from "@/components/Hero";
import About from "@/components/About";
import StyleGrid from "@/components/StyleGrid";
import Values from "@/components/Values";
import LeadBanner from "@/components/LeadBanner";
import Testimonials from "@/components/Testimonials";
import TrustedBy from "@/components/TrustedBy";

export default function HomePage() {
  return (
    <>
      <Hero />
      <About />
      <StyleGrid />
      <Values />
      <TrustedBy />
      <LeadBanner />
      <Testimonials />
    </>
  );
}
