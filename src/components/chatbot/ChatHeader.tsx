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
      console.log('Avatar URL received:', avatarUrl);
      const { data } = supabase.storage
        .from('chatbot-avatars')
        .getPublicUrl(avatarUrl);
      
      if (data?.publicUrl) {
        console.log('Public URL generated:', data.publicUrl);
        setPublicAvatarUrl(data.publicUrl);
      } else {
        console.error('Failed to generate public URL for:', avatarUrl);
      }
    } else {
      console.log('No avatar URL provided');
      setPublicAvatarUrl('');
    }
  }, [avatarUrl]);

  return (
    <div className="text-center border-b pb-4 flex items-center justify-center gap-3">
      <Avatar className="h-8 w-8">
        <AvatarImage 
          src={publicAvatarUrl} 
          alt={botName}
          onError={(e) => {
            console.error('Failed to load avatar image:', e);
            setPublicAvatarUrl('');
          }}
        />
        <AvatarFallback>
          <User className="h-4 w-4 text-muted-foreground" />
        </AvatarFallback>
      </Avatar>
      <h3 className="font-bold text-secondary">{botName}</h3>
    </div>
  );
};