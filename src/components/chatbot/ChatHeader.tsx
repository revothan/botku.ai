import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { User } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";

type ChatHeaderProps = {
  botName: string;
  avatarUrl?: string | null;
};

export const ChatHeader = ({ botName, avatarUrl }: ChatHeaderProps) => {
  // Get the public URL directly, similar to how it's done in the preview
  const publicUrl = avatarUrl 
    ? supabase.storage.from('chatbot-avatars').getPublicUrl(avatarUrl).data.publicUrl 
    : '';

  return (
    <div className="text-center border-b pb-4 flex items-center justify-center gap-3">
      <Avatar className="h-8 w-8">
        <AvatarImage 
          src={publicUrl} 
          alt={botName}
          onError={(e) => {
            console.error('Failed to load avatar image:', e);
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