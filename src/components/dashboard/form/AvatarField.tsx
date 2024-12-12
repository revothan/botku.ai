import { useState } from "react";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Loader2, User, Lock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import type { UseFormReturn } from "react-hook-form";
import type { ChatbotFormData } from "@/types/chatbot";

interface AvatarFieldProps {
  form: UseFormReturn<ChatbotFormData>;
  defaultAvatarUrl?: string | null;
  profileId: string;
}

const AvatarField = ({ form, defaultAvatarUrl, profileId }: AvatarFieldProps) => {
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();
  
  const avatarUrl = form.watch("avatar_url");
  const publicAvatarUrl = avatarUrl || defaultAvatarUrl 
    ? supabase.storage.from('chatbot-avatars').getPublicUrl(avatarUrl || defaultAvatarUrl || '').data.publicUrl
    : null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    toast({
      title: "Coming Soon",
      description: "Avatar customization will be available soon!",
    });
  };

  return (
    <FormField
      control={form.control}
      name="avatar_url"
      render={() => (
        <FormItem>
          <FormLabel>Chatbot Avatar</FormLabel>
          <FormControl>
            <div className="relative">
              <div className="flex items-center gap-4 opacity-60">
                <Avatar className="h-20 w-20">
                  <AvatarImage src={publicAvatarUrl || ''} alt="Chatbot avatar" />
                  <AvatarFallback>
                    <User className="h-10 w-10 text-muted-foreground" />
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="cursor-not-allowed"
                    disabled
                  />
                </div>
              </div>
              {/* Coming Soon Overlay */}
              <div className="absolute inset-0 flex items-center justify-center bg-background/50 backdrop-blur-[1px]">
                <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-secondary text-secondary-foreground">
                  <Lock className="h-4 w-4" />
                  <span className="text-sm font-medium">Coming Soon</span>
                </div>
              </div>
            </div>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export default AvatarField;