import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { useEffect, useState } from "react";

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
    <main className="max-w-6xl mx-auto py-16">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        {/* Text Content */}
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

        {/* Chat Preview */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <Card className="border-none shadow-lg bg-white/80 backdrop-blur-sm">
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