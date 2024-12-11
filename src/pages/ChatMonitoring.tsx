import { useEffect, useState } from "react";
import { useSession } from "@supabase/auth-helpers-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
import type { ChatSession, ChatMessage, ChatSessionStatus } from "@/types/chat";

const ChatMonitoring = () => {
  const session = useSession();
  const [realtimeSessions, setRealtimeSessions] = useState<Record<string, ChatSession>>({});

  const { data: initialSessions, isLoading } = useQuery({
    queryKey: ["chat-sessions"],
    queryFn: async () => {
      const { data: sessions, error } = await supabase
        .from("chat_sessions")
        .select(`
          *,
          messages:chat_messages(*)
        `)
        .eq("profile_id", session?.user?.id)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching chat sessions:", error);
        throw error;
      }

      const sessionsMap: Record<string, ChatSession> = {};
      sessions?.forEach((session: any) => {
        sessionsMap[session.id] = session;
      });

      return sessionsMap;
    },
    enabled: !!session?.user?.id,
  });

  useEffect(() => {
    if (!session?.user?.id) return;

    // Subscribe to new chat sessions
    const sessionsChannel = supabase
      .channel("chat-sessions")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "chat_sessions",
          filter: `profile_id=eq.${session.user.id}`,
        },
        (payload) => {
          console.log("Chat session change:", payload);
          setRealtimeSessions((current) => {
            if (payload.eventType === "DELETE") {
              const { [payload.old.id]: _, ...rest } = current;
              return rest;
            }
            return {
              ...current,
              [payload.new.id]: {
                ...current[payload.new.id],
                ...payload.new,
              },
            };
          });
        }
      )
      .subscribe();

    // Subscribe to chat messages
    const messagesChannel = supabase
      .channel("chat-messages")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "chat_messages",
        },
        (payload) => {
          console.log("New chat message:", payload);
          const message = payload.new as ChatMessage;
          setRealtimeSessions((current) => {
            const session = current[message.session_id];
            if (!session) return current;
            return {
              ...current,
              [message.session_id]: {
                ...session,
                messages: [...(session.messages || []), message],
              },
            };
          });
        }
      )
      .subscribe();

    return () => {
      sessionsChannel.unsubscribe();
      messagesChannel.unsubscribe();
    };
  }, [session?.user?.id]);

  const sessions = {
    ...(initialSessions || {}),
    ...realtimeSessions,
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Chat Sessions</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Object.values(sessions)
          .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
          .map((session) => (
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
                              : "bg-muted"
                          }`}
                        >
                          <p className="text-sm">{message.content}</p>
                          <span className="text-xs opacity-70">
                            {formatDistanceToNow(new Date(message.created_at))} ago
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          ))}
      </div>
    </div>
  );
};

export default ChatMonitoring;