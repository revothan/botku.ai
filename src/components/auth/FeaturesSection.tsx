import { Bot, MessageSquare, Zap } from "lucide-react";
import { motion } from "framer-motion";

export const FeaturesSection = () => {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.6 }}
      className="space-y-8 text-left"
    >
      <h1 className="text-4xl font-bold text-[#075e54]">
        Welcome to Menyapa
      </h1>
      <p className="text-lg text-gray-600">
        Join thousands of businesses leveraging AI to enhance their customer experience
      </p>
      
      <div className="space-y-4">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex items-start gap-3 p-4 rounded-lg bg-white/50 backdrop-blur-sm border border-primary/10"
        >
          <Bot className="w-6 h-6 text-primary mt-1" />
          <div>
            <h3 className="font-semibold text-gray-800">AI-Powered Assistant</h3>
            <p className="text-sm text-gray-600">24/7 customer support with intelligent responses</p>
          </div>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex items-start gap-3 p-4 rounded-lg bg-white/50 backdrop-blur-sm border border-primary/10"
        >
          <MessageSquare className="w-6 h-6 text-primary mt-1" />
          <div>
            <h3 className="font-semibold text-gray-800">Smart Conversations</h3>
            <p className="text-sm text-gray-600">Natural language processing for better understanding</p>
          </div>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="flex items-start gap-3 p-4 rounded-lg bg-white/50 backdrop-blur-sm border border-primary/10"
        >
          <Zap className="w-6 h-6 text-primary mt-1" />
          <div>
            <h3 className="font-semibold text-gray-800">Instant Setup</h3>
            <p className="text-sm text-gray-600">Get started in minutes with our easy setup process</p>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};