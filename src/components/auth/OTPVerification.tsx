import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";

export const OTPVerification = ({ email }: { email: string }) => {
  const [otp, setOtp] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleVerify = async () => {
    try {
      setIsVerifying(true);
      const { error } = await supabase.auth.verifyOtp({
        email,
        token: otp,
        type: 'signup'
      });

      if (error) throw error;

      toast({
        title: "Verification successful",
        description: "Your account has been verified. Redirecting to dashboard...",
      });

      // Redirect to dashboard after successful verification
      setTimeout(() => navigate('/dashboard'), 1500);
    } catch (error: any) {
      console.error('Verification error:', error);
      toast({
        title: "Verification failed",
        description: error.message || "Please try again",
        variant: "destructive",
      });
    } finally {
      setIsVerifying(false);
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
          <h2 className="text-2xl font-bold tracking-tight text-[#075e54] mb-2">Verify Your Account</h2>
          <p className="text-sm text-gray-600 mb-4">
            Please enter the verification code sent to {email}
          </p>
        </div>

        <div className="space-y-6">
          <InputOTP
            maxLength={6}
            value={otp}
            onChange={(value) => setOtp(value)}
            render={({ slots }) => (
              <InputOTPGroup className="gap-2 justify-center">
                {slots.map((slot, index) => (
                  <InputOTPSlot key={index} {...slot} />
                ))}
              </InputOTPGroup>
            )}
          />

          <Button 
            className="w-full bg-[#25d366] hover:bg-[#128c7e] text-white"
            onClick={handleVerify}
            disabled={otp.length !== 6 || isVerifying}
          >
            {isVerifying ? "Verifying..." : "Verify Account"}
          </Button>
        </div>
      </div>
    </motion.div>
  );
};