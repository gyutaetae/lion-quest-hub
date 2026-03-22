"use client";

import Hero from "@/components/landing/Hero";
import Features from "@/components/landing/Features";
import LevelShowcase from "@/components/landing/LevelShowcase";
import Footer from "@/components/landing/Footer";

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
