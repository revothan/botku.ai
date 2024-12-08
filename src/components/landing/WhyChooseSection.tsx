import { motion } from "framer-motion";

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

export const WhyChooseSection = () => {
  return (
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
  );
};