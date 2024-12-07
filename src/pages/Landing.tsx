import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Link as LinkIcon, MessageSquare, Users, Settings } from "lucide-react";

const Landing = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#fcf5eb] to-white">
      {/* Header Section */}
      <div className="container mx-auto px-4 py-6">
        <nav className="flex justify-between items-center mb-16">
          <h1 className="text-2xl font-bold tracking-tight text-[#075e54]">BOTKU.AI</h1>
          <div className="hidden md:flex space-x-8 text-[#075e54]">
            <Button variant="ghost" className="hover:text-[#128c7e]">Beranda</Button>
            <Button variant="ghost" className="hover:text-[#128c7e]">Fitur</Button>
            <Button variant="ghost" className="hover:text-[#128c7e]">Harga</Button>
            <Button variant="ghost" className="hover:text-[#128c7e]">Kontak</Button>
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

        {/* Hero Section */}
        <main className="max-w-4xl mx-auto text-center py-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-6"
          >
            <h1 className="text-4xl md:text-6xl font-bold text-[#075e54] leading-tight">
              BOTKU.AI
              <span className="block text-xl md:text-2xl mt-4 text-[#128c7e]">
                🇮🇩 Solusi Digital Karya Anak Bangsa untuk Produktivitas Maksimal
              </span>
            </h1>
            
            <Button 
              size="lg" 
              className="mt-8 bg-[#25d366] hover:bg-[#128c7e] text-white px-8"
              asChild
            >
              <Link to="/login">Coba Gratis Sekarang</Link>
            </Button>
          </motion.div>

          {/* Features Section */}
          <div className="mt-32">
            <h2 className="text-3xl font-bold text-[#075e54] mb-16">
              Apa yang Bisa BOTKU.AI Lakukan untuk Anda?
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.6, delay: 0.2 * index }}
                  className="p-6 rounded-2xl bg-white/80 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="w-12 h-12 rounded-full bg-[#25d366]/10 flex items-center justify-center mb-4 mx-auto">
                    {feature.icon}
                  </div>
                  <h3 className="text-lg font-semibold mb-2 text-[#075e54]">{feature.title}</h3>
                  <p className="text-[#128c7e]">{feature.description}</p>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Why Choose Section */}
          <div className="mt-32">
            <h2 className="text-3xl font-bold text-[#075e54] mb-16">
              Mengapa Pilih BOTKU.AI?
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {reasons.map((reason, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.6, delay: 0.2 * index }}
                  className="p-6 rounded-2xl bg-white/80 shadow-sm"
                >
                  <h3 className="text-xl font-semibold mb-2 text-[#075e54]">{reason.title}</h3>
                  <p className="text-[#128c7e]">{reason.description}</p>
                </motion.div>
              ))}
            </div>
          </div>

          {/* CTA Section */}
          <div className="mt-32 p-12 rounded-3xl bg-gradient-to-r from-[#25d366] to-[#128c7e]">
            <h2 className="text-3xl font-bold text-white mb-4">Mulai Sekarang</h2>
            <p className="text-white/90 mb-8 max-w-2xl mx-auto">
              Gabung dengan kreator dan pengusaha lainnya yang telah meningkatkan produktivitas mereka dengan BOTKU.AI.
            </p>
            <Button 
              size="lg" 
              className="bg-white text-[#075e54] hover:bg-white/90"
              asChild
            >
              <Link to="/login">Coba Gratis Sekarang</Link>
            </Button>
          </div>
        </main>
      </div>

      {/* Footer */}
      <footer className="bg-[#075e54] text-white mt-32 py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-2xl font-bold mb-4">BOTKU.AI</h3>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2">
                <li><a href="#" className="hover:text-[#25d366]">Beranda</a></li>
                <li><a href="#" className="hover:text-[#25d366]">Fitur</a></li>
                <li><a href="#" className="hover:text-[#25d366]">Harga</a></li>
                <li><a href="#" className="hover:text-[#25d366]">Kontak</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-white/10 mt-8 pt-8 text-center">
            <p>© 2024 BOTKU.AI. All Rights Reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

const features = [
  {
    title: "Manajemen Tautan yang Cerdas",
    description: "Kelola semua tautan penting Anda dalam satu halaman profesional yang mudah diakses audiens.",
    icon: <LinkIcon className="w-6 h-6 text-[#25d366]" />,
  },
  {
    title: "Asisten AI 24/7",
    description: "Tambahkan bot berbasis AI untuk menjawab pertanyaan, membantu pelanggan, atau memberikan rekomendasi sesuai kebutuhan.",
    icon: <MessageSquare className="w-6 h-6 text-[#25d366]" />,
  },
  {
    title: "Optimalkan Interaksi",
    description: "Hubungkan audiens Anda langsung ke konten atau layanan yang relevan dengan fitur interaktif berbasis AI.",
    icon: <Users className="w-6 h-6 text-[#25d366]" />,
  },
  {
    title: "Personalisasi Tanpa Batas",
    description: "Sesuaikan halaman Anda dengan desain dan fitur unik yang mencerminkan identitas Anda.",
    icon: <Settings className="w-6 h-6 text-[#25d366]" />,
  },
];

const reasons = [
  {
    title: "Karya Anak Bangsa",
    description: "Bangga mendukung teknologi lokal dengan kualitas global.",
  },
  {
    title: "Efisiensi Maksimal",
    description: "Satu platform, berbagai solusi produktivitas.",
  },
  {
    title: "Teknologi Cerdas",
    description: "Integrasi dengan AI untuk hasil yang lebih personal dan responsif.",
  },
  {
    title: "Mudah Digunakan",
    description: "Antarmuka sederhana dan ramah pengguna, tanpa perlu kemampuan teknis khusus.",
  },
];

export default Landing;
