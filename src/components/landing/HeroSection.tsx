import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { useEffect, useState } from "react";
import { Bot, Sparkles, Zap } from "lucide-react";

export const HeroSection = () => {
  // Chat animation state
  const [messages, setMessages] = useState<Array<{ content: string; role: 'assistant' | 'user' }>>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  const demoMessages = [
    { content: "Halo! Saya YourAI, asisten virtual Anda. Ada yang bisa saya bantu?", role: 'assistant' as const },
    { content: "Jam berapa toko buka?", role: 'user' as const },
    { content: "Toko kami buka setiap hari dari jam 09.00 - 21.00 WIB. Ada yang bisa saya bantu lagi?", role: 'assistant' as const },
    { content: "Apakah tersedia layanan delivery?", role: 'user' as const },
    { content: "Ya, kami menyediakan layanan delivery melalui GoJek dan Grab. Silakan hubungi kami di WhatsApp 081234567890 untuk informasi lebih lanjut.", role: 'assistant' as const },
  ];

  useEffect(() => {
    if (currentIndex < demoMessages.length) {
      const timer = setTimeout(() => {
        setMessages(prev => [...prev, demoMessages[currentIndex]]);
        setCurrentIndex(prev => prev + 1);
      }, currentIndex === 0 ? 1000 : 2000);

      return () => clearTimeout(timer);
    }
  }, [currentIndex]);

  return (
    <main className="relative max-w-6xl mx-auto py-16">
      {/* Background decorative elements */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-40 -right-32 w-[500px] h-[500px] bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-32 w-[500px] h-[500px] bg-secondary/10 rounded-full blur-3xl" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        {/* Text Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="space-y-8"
        >
          <div className="space-y-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary"
            >
              <Sparkles className="w-4 h-4" />
              <span className="text-sm font-medium">Powered by AI</span>
            </motion.div>

            <h1 className="text-4xl md:text-6xl font-bold text-[#075e54] leading-tight">
              MENYAPA
              <span className="block text-xl md:text-2xl mt-4 text-[#128c7e]">
                🇮🇩 AI Chatbot Karya Anak Bangsa untuk Produktivitas Maksimal
              </span>
            </h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-lg text-gray-600 max-w-xl"
            >
              Tingkatkan efisiensi bisnis Anda dengan asisten AI yang siap membantu 24/7. Mudah digunakan, cerdas, dan selalu siap melayani.
            </motion.p>
          </div>
          
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="flex flex-wrap gap-4"
          >
            <Button 
              size="lg" 
              className="bg-[#25d366] hover:bg-[#128c7e] text-white px-8 gap-2"
              asChild
            >
              <Link to="/login">
                <Bot className="w-5 h-5" />
                Coba Gratis Sekarang
              </Link>
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              className="gap-2"
              asChild
            >
              <Link to="#features">
                <Zap className="w-5 h-5" />
                Lihat Fitur
              </Link>
            </Button>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="grid grid-cols-3 gap-4 pt-8 border-t"
          >
            {[
              { label: "Pengguna Aktif", value: "1,000+" },
              { label: "Pesan/Hari", value: "10,000+" },
              { label: "Tingkat Kepuasan", value: "98%" },
            ].map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-2xl font-bold text-primary">{stat.value}</div>
                <div className="text-sm text-gray-600">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </motion.div>

        {/* Chat Preview */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="relative"
        >
          {/* Decorative elements */}
          <div className="absolute -top-4 -right-4 w-24 h-24 bg-primary/5 rounded-full blur-xl" />
          <div className="absolute -bottom-4 -left-4 w-24 h-24 bg-secondary/5 rounded-full blur-xl" />
          
          <Card className="border-none shadow-xl bg-white/90 backdrop-blur-sm">
            <CardContent className="p-4">
              <div className="text-center border-b pb-4">
                <h3 className="font-bold text-secondary">YourAI</h3>
              </div>
              <div className="h-[400px] py-4 space-y-4 overflow-y-auto">
                {messages.map((message, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className={`${
                      message.role === 'assistant'
                        ? "bg-primary/10 rounded-lg p-3 max-w-[80%]"
                        : "bg-primary/5 rounded-lg p-3 max-w-[80%] ml-auto"
                    }`}
                  >
                    <p className="text-sm">{message.content}</p>
                  </motion.div>
                ))}
                {currentIndex < demoMessages.length && (
                  <div className="bg-primary/10 rounded-lg p-3 max-w-[80%]">
                    <div className="flex space-x-2">
                      <div className="w-2 h-2 bg-primary/30 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-primary/30 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                      <div className="w-2 h-2 bg-primary/30 rounded-full animate-bounce [animation-delay:0.4s]"></div>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </main>
  );
};