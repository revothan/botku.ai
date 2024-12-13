import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

interface ChatbotAvatarUploadProps {
  userId: string;
  currentAvatarUrl: string | null;
  botName: string;
}

const ChatbotAvatarUpload = ({ userId, currentAvatarUrl, botName }: ChatbotAvatarUploadProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setIsSubmitting(true);

      // Upload image to storage
      const fileExt = file.name.split('.').pop();
      const filePath = `${crypto.randomUUID()}.${fileExt}`;

      // Convert File object to ArrayBuffer
      const arrayBuffer = await file.arrayBuffer();
      const fileData = new Uint8Array(arrayBuffer);

      const { error: uploadError } = await supabase.storage
        .from('chatbot-avatars')
        .upload(filePath, fileData, {
          contentType: file.type,
          upsert: false
        });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('chatbot-avatars')
        .getPublicUrl(filePath);

      // Update chatbot settings with new avatar URL
      const { error: updateError } = await supabase
        .from('chatbot_settings')
        .update({ avatar_url: publicUrl })
        .eq('profile_id', userId);

      if (updateError) throw updateError;

      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ["chatbot-settings"] });

      toast({
        title: "Success",
        description: "Chatbot avatar updated successfully",
      });

    } catch (error: any) {
      console.error('Error uploading avatar:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to update avatar. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="p-6">
      <div className="flex items-center gap-6">
        <Avatar className="h-20 w-20">
          <AvatarImage src={currentAvatarUrl || ''} alt={botName} />
          <AvatarFallback>{botName[0]?.toUpperCase()}</AvatarFallback>
        </Avatar>

        <div className="flex-1 space-y-4">
          <h2 className="text-lg font-semibold">Chatbot Avatar</h2>
          <div className="flex gap-4">
            <Input
              type="file"
              accept="image/*"
              onChange={handleAvatarUpload}
              disabled={isSubmitting}
            />
            {isSubmitting && (
              <Loader2 className="h-4 w-4 animate-spin" />
            )}
          </div>
        </div>
      </div>
    </Card>
  );
};

export default ChatbotAvatarUpload;