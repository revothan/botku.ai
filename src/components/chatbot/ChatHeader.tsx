import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { User } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";

type ChatHeaderProps = {
  botName: string;
  avatarUrl?: string | null;
};

export const ChatHeader = ({ botName, avatarUrl }: ChatHeaderProps) => {
  const [publicAvatarUrl, setPublicAvatarUrl] = useState<string>('');

  useEffect(() => {
    if (avatarUrl) {
      // Get the public URL directly without try/catch since getPublicUrl is synchronous
      const { data } = supabase.storage
        .from('chatbot-avatars')
        .getPublicUrl(avatarUrl);
      
      if (data?.publicUrl) {
        console.log('Setting avatar URL:', data.publicUrl);
        setPublicAvatarUrl(data.publicUrl);
      }
    }
  }, [avatarUrl]);

  return (
    <div className="text-center border-b pb-4 flex items-center justify-center gap-3">
      <Avatar className="h-8 w-8">
        {publicAvatarUrl && (
          <AvatarImage 
            src={publicAvatarUrl} 
            alt={botName}
            onError={(e) => {
              console.error('Failed to load avatar image:', e);
              setPublicAvatarUrl('');
            }}
          />
        )}
        <AvatarFallback>
          <User className="h-4 w-4 text-muted-foreground" />
        </AvatarFallback>
      </Avatar>
      <h3 className="font-bold text-secondary">{botName}</h3>
    </div>
  );
};