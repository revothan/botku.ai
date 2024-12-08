import { useEffect, useRef } from "react";
import { Navigation } from "@/components/landing/Navigation";
import { HeroSection } from "@/components/landing/HeroSection";
import { FeaturesSection } from "@/components/landing/FeaturesSection";
import { WhyChooseSection } from "@/components/landing/WhyChooseSection";
import { CTASection } from "@/components/landing/CTASection";
import { Footer } from "@/components/landing/Footer";

const Landing = () => {
  const scrollToFeatures = () => {
    const featuresSection = document.querySelector("#features");
    featuresSection?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#fcf5eb] to-white">
      <div className="container mx-auto px-4 py-6">
        <Navigation scrollToFeatures={scrollToFeatures} />
        <HeroSection />
        <FeaturesSection />
        <WhyChooseSection />
        <CTASection />
      </div>
      <Footer />
    </div>
  );
};

export default Landing;