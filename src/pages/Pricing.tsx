import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Check } from "lucide-react";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";

const Pricing = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#fcf5eb] to-white">
      {/* Navigation Bar */}
      <nav className="border-b bg-white/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="font-bold text-xl text-secondary">
            BOTKU
          </Link>
          <NavigationMenu>
            <NavigationMenuList>
              <NavigationMenuItem>
                <Link to="/pricing">
                  <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                    Pricing
                  </NavigationMenuLink>
                </Link>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <Link to="/login">
                  <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                    Login
                  </NavigationMenuLink>
                </Link>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>
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
            BOTKU.AI berkomitmen untuk memberikan solusi terbaik untuk Anda
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
  );
};

const benefits = [
  "Chatbot AI yang Cerdas dan Responsif",
  "Manajemen Link Tanpa Batas",
  "Domain Kustom Gratis",
  "Analitik Pengunjung Real-time",
  "Personalisasi Tampilan",
  "Dukungan Bahasa Indonesia",
  "Integrasi dengan WhatsApp",
  "Update Fitur Berkala",
];

export default Pricing;
