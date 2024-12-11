import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatDistanceToNow } from "date-fns";
import { ChatControls } from "./ChatControls";
import { ChatInput } from "./ChatInput";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { ChatSession } from "@/types/chat";

interface ChatMonitoringCardProps {
  session: ChatSession;
}

export const ChatMonitoringCard = ({ session }: ChatMonitoringCardProps) => {
  const [isAiEnabled, setIsAiEnabled] = useState(true);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || isLoading) return;

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from("chat_messages")
        .insert({
          session_id: session.id,
          role: "owner",
          content: inputMessage
        });

      if (error) throw error;
      setInputMessage("");
    } catch (error: any) {
      console.error("Error sending message:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="relative">
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
        <ChatControls
          sessionId={session.id}
          isAiEnabled={isAiEnabled}
          onToggleAi={() => setIsAiEnabled(!isAiEnabled)}
        />
        <ScrollArea className="h-[300px]">
          <div className="space-y-4">
            {session.messages?.map((message) => (
              <div
                key={message.id}
                className={`flex ${
                  message.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`rounded-lg px-3 py-2 max-w-[80%] ${
                    message.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : message.role === "owner"
                      ? "bg-secondary text-secondary-foreground"
                      : "bg-muted"
                  }`}
                >
                  <p className="text-sm">{message.content}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs opacity-70">
                      {formatDistanceToNow(new Date(message.created_at))} ago
                    </span>
                    <Badge variant="outline" className="text-[10px] px-1">
                      {message.role === "owner" ? "Owner" : message.role === "assistant" ? "AI" : "Visitor"}
                    </Badge>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
        <div className="mt-4">
          <ChatInput
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