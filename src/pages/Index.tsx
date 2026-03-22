import Hero from "@/components/landing/Hero";
import Features from "@/components/landing/Features";
import LevelShowcase from "@/components/landing/LevelShowcase";
import Footer from "@/components/landing/Footer";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Hero />
      <Features />
      <LevelShowcase />
      <Footer />
    </div>
  );
};

export default Index;
