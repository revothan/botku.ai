import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";

interface OTPVerificationProps {
  email: string;
  onVerificationComplete?: () => void;
}

export const OTPVerification = ({ email, onVerificationComplete }: OTPVerificationProps) => {
  const [otp, setOtp] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsVerifying(true);

    try {
      const { error } = await supabase.auth.verifyOtp({
        email,
        token: otp,
        type: 'signup'
      });

      if (error) {
        throw error;
      }

      toast({
        title: "Verification successful",
        description: "Your email has been verified. Redirecting to dashboard...",
      });

      if (onVerificationComplete) {
        onVerificationComplete();
      }
      
      navigate('/dashboard');
    } catch (error: any) {
      console.error('Verification error:', error);
      toast({
        title: "Verification failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResendCode = async () => {
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email,
      });

      if (error) {
        throw error;
      }

      toast({
        title: "Code resent",
        description: "A new verification code has been sent to your email",
      });
    } catch (error: any) {
      console.error('Resend error:', error);
      toast({
        title: "Failed to resend code",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-semibold mb-2">Verify your email</h2>
        <p className="text-sm text-muted-foreground">
          We've sent a verification code to {email}
        </p>
      </div>

      <form onSubmit={handleVerification} className="space-y-4">
        <div>
          <Input
            type="text"
            placeholder="Enter verification code"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            className="text-center text-lg tracking-widest"
            maxLength={6}
          />
        </div>

        <Button
          type="submit"
          className="w-full bg-[#25d366] hover:bg-[#128c7e]"
          disabled={isVerifying || otp.length < 6}
        >
          {isVerifying ? "Verifying..." : "Verify Email"}
        </Button>

        <div className="text-center">
          <Button
            type="button"
            variant="link"
            onClick={handleResendCode}
            className="text-sm text-muted-foreground hover:text-primary"
          >
            Didn't receive the code? Resend
          </Button>
        </div>
      </form>
    </div>
  );
};