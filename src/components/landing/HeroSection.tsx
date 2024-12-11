import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { useEffect, useState } from "react";
import { Bot, Sparkles, Zap } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

export const HeroSection = () => {
  // Chat animation state
  const [messages, setMessages] = useState<Array<{ content: string; role: 'assistant' | 'user' }>>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  const demoProducts = [
    {
      id: 1,
      name: "Premium Coffee Beans",
      price: 150000,
      image_url: "https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=800&h=600&fit=crop",
      stock: 50
    },
    {
      id: 2,
      name: "Coffee Drip Kit",
      price: 299000,
      image_url: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800&h=600&fit=crop",
      stock: 25
    }
  ];

  const demoMessages = [
    { content: "Halo! Saya YourAI, asisten virtual Anda. Ada yang bisa saya bantu?", role: 'assistant' as const },
    { content: "Saya ingin beli kopi", role: 'user' as const },
    { 
      content: "Berikut beberapa produk kopi yang kami miliki:", 
      role: 'assistant' as const,
      showProducts: true 
    },
    { content: "Berapa harga Coffee Drip Kit?", role: 'user' as const },
    { content: "Coffee Drip Kit dijual dengan harga Rp 299.000. Stok tersedia 25 unit. Apakah Anda ingin melakukan pemesanan?", role: 'assistant' as const },
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

  const scrollToFeatures = () => {
    const featuresSection = document.getElementById('features');
    if (featuresSection) {
      featuresSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

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
              onClick={scrollToFeatures}
            >
              <Zap className="w-5 h-5" />
              Lihat Fitur
            </Button>
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
                    {message.showProducts && (
                      <div className="mt-4 overflow-x-auto flex space-x-4 pb-2">
                        {demoProducts.map((product) => (
                          <div
                            key={product.id}
                            className="flex-none w-48 border rounded-lg p-3 bg-white shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                          >
                            <img
                              src={product.image_url}
                              alt={product.name}
                              className="w-full h-32 object-cover rounded-md mb-2"
                            />
                            <h4 className="font-medium text-sm">{product.name}</h4>
                            <p className="text-primary font-medium text-sm mt-1">
                              {formatCurrency(product.price)}
                            </p>
                            {product.stock !== null && product.stock > 0 && (
                              <p className="text-xs text-muted-foreground mt-1">
                                Stock: {product.stock}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
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