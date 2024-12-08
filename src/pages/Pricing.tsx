import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Check } from "lucide-react";

const Pricing = () => {
  const scrollToFeatures = () => {
    const featuresSection = document.querySelector("#features");
    featuresSection?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#fcf5eb] to-white">
      {/* Header Section */}
      <div className="container mx-auto px-4 py-6">
        <nav className="flex justify-between items-center mb-16">
          <h1 className="text-2xl font-bold tracking-tight text-[#075e54]">MENYAPA</h1>
          <div className="hidden md:flex space-x-8 text-[#075e54]">
            <Button variant="ghost" asChild className="hover:text-[#128c7e]">
              <Link to="/">Beranda</Link>
            </Button>
            <Button variant="ghost" onClick={scrollToFeatures} className="hover:text-[#128c7e]">
              Fitur
            </Button>
            <Button variant="ghost" asChild className="hover:text-[#128c7e]">
              <Link to="/pricing">Harga</Link>
            </Button>
          </div>
          <div className="flex space-x-4">
            <Button variant="ghost" asChild className="hidden md:inline-flex">
              <Link to="/login">Masuk</Link>
            </Button>
            <Button 
              className="bg-[#25d366] hover:bg-[#128c7e] text-white"
              asChild
            >
              <Link to="/login">Coba Gratis Sekarang</Link>
            </Button>
          </div>
        </nav>

        <div className="container mx-auto px-4 py-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-3xl mx-auto"
          >
            <h1 className="text-4xl md:text-5xl font-bold text-[#075e54] mb-6">
              Gratis untuk Semua
            </h1>
            <p className="text-lg text-[#128c7e] mb-12">
              MENYAPA berkomitmen untuk memberikan solusi terbaik untuk Anda
            </p>

            <div className="bg-white rounded-2xl shadow-lg p-8 mb-12">
              <div className="text-3xl font-bold text-[#075e54] mb-4">
                Rp 0
                <span className="text-lg font-normal text-[#128c7e]">/bulan</span>
              </div>

              <ul className="space-y-4 text-left mb-8">
                {benefits.map((benefit, index) => (
                  <motion.li
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    className="flex items-start gap-3"
                  >
                    <Check className="h-5 w-5 text-[#25d366] mt-1 flex-shrink-0" />
                    <span className="text-[#128c7e]">{benefit}</span>
                  </motion.li>
                ))}
              </ul>

              <Button
                size="lg"
                className="w-full bg-[#25d366] hover:bg-[#128c7e] text-white"
                asChild
              >
                <Link to="/login">Mulai Sekarang - Gratis!</Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

const benefits = [
  "Chatbot AI yang Cerdas dan Responsif",
  "Manajemen",
  "Domain Kustom Gratis",
  "Dukungan Bahasa Indonesia",
  "Update Fitur Berkala",
];

export default Pricing;