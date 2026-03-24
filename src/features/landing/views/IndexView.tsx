"use client";

import Hero from "@/features/landing/components/Hero";
import Features from "@/features/landing/components/Features";
import LevelShowcase from "@/features/landing/components/LevelShowcase";
import Footer from "@/features/landing/components/Footer";

const IndexView = () => {
  return (
    <div className="min-h-screen">
      <Hero />
      <Features />
      <LevelShowcase />
      <Footer />
    </div>
  );
};

export default IndexView;
