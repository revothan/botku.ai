import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { motion } from "framer-motion";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { OTPVerification } from "./OTPVerification";

export const AuthForm = () => {
  const [showOTP, setShowOTP] = useState(false);
  const [email, setEmail] = useState("");

  const handleAuthStateChange = async (event: any, session: any) => {
    console.log("Auth state changed:", { event, session });
    
    if (event === "SIGNED_UP") {
      setEmail(session?.user?.email || "");
      setShowOTP(true);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="relative w-full md:w-auto"
    >
      <div className="absolute -top-4 -right-4 w-24 h-24 bg-primary/5 rounded-full blur-xl" />
      <div className="absolute -bottom-4 -left-4 w-24 h-24 bg-secondary/5 rounded-full blur-xl" />
      
      <div className="bg-white/80 backdrop-blur-sm p-8 rounded-lg shadow-lg border border-primary/10">
        <div className="mb-6 text-center">
          <h2 className="text-2xl font-bold tracking-tight text-[#075e54] mb-2">MENYAPA</h2>
          <p className="text-sm text-gray-600">Sign in to your account or create a new one</p>
        </div>
        
        {showOTP ? (
          <OTPVerification 
            email={email}
            onVerificationComplete={() => setShowOTP(false)}
          />
        ) : (
          <Auth
            supabaseClient={supabase}
            appearance={{
              theme: ThemeSupa,
              variables: {
                default: {
                  colors: {
                    brand: '#25d366',
                    brandAccent: '#128c7e',
                  },
                },
              },
              className: {
                container: 'auth-container',
                button: 'auth-button',
                input: 'auth-input',
              },
            }}
            theme="light"
            providers={[]}
            onAuthStateChange={handleAuthStateChange}
          />
        )}
      </div>
    </motion.div>
  );
};