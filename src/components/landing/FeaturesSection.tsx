import { motion } from "framer-motion";
import { LinkIcon, MessageSquare, Users, Settings } from "lucide-react";

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

export const FeaturesSection = () => {
  return (
    <div className="mt-32" id="features">
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
  );
};