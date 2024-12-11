import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatDistanceToNow } from "date-fns";
import { ChatMessage } from "./ChatMessage";
import { OwnerChatInput } from "./OwnerChatInput";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import type { ChatSession } from "@/types/chat";

interface ChatSessionCardProps {
  session: ChatSession;
}

export const ChatSessionCard = ({ session }: ChatSessionCardProps) => {
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from("chat_messages")
        .insert({
          session_id: session.id,
          role: "owner",
          content: inputMessage.trim()
        });

      if (error) throw error;
      setInputMessage("");
    } catch (error: any) {
      console.error("Error sending message:", error);
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card key={session.id} className="relative">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-sm font-medium">
            Visitor {session.visitor_id.slice(0, 8)}
          </CardTitle>
          <Badge 
            variant={
              session.status === "active" 
                ? "default" 
                : session.status === "ended" 
                  ? "secondary" 
                  : "outline"
            }
          >
            {session.status}
          </Badge>
        </div>
        <div className="text-xs text-muted-foreground">
          Started {formatDistanceToNow(new Date(session.created_at))} ago
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[300px]">
          <div className="space-y-4">
            {session.messages?.map((message) => (
              <ChatMessage key={message.id} message={message} />
            ))}
          </div>
        </ScrollArea>
        <div className="mt-4">
          <OwnerChatInput
            inputMessage={inputMessage}
            setInputMessage={setInputMessage}
            handleSubmit={handleSubmit}
            isLoading={isLoading}
          />
        </div>
      </CardContent>
    </Card>
  );
};