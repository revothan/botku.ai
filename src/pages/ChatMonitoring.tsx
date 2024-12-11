import { useEffect, useState } from "react";
import { useSession } from "@supabase/auth-helpers-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
import type { ChatSession, ChatMessage } from "@/types/chat";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2 } from "lucide-react";

const ChatMonitoring = () => {
  const session = useSession();
  const [realtimeSessions, setRealtimeSessions] = useState<Record<string, ChatSession>>({});

  const { data: initialSessions, isLoading, error } = useQuery({
    queryKey: ["chat-sessions"],
    queryFn: async () => {
      if (!session?.user?.id) {
        throw new Error("No authenticated user");
      }

      console.log("Fetching chat sessions for user:", session.user.id);
      
      // First get the user's profile
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("id, custom_domain")
        .eq("id", session.user.id)
        .single();

      if (profileError) {
        console.error("Error fetching profile:", profileError);
        throw profileError;
      }

      console.log("Found profile:", profile);

      // Then get all chat sessions for this profile that have at least one message
      const { data: sessions, error: sessionsError } = await supabase
        .from("chat_sessions")
        .select(`
          *,
          chat_messages!inner (
            id,
            role,
            content,
            created_at
          )
        `)
        .eq("profile_id", profile.id);

      if (sessionsError) {
        console.error("Error fetching chat sessions:", sessionsError);
        throw sessionsError;
      }

      console.log("Raw sessions data:", sessions);

      // Group messages by session
      const sessionsMap: Record<string, ChatSession> = {};
      sessions?.forEach((session: any) => {
        const messages = session.chat_messages || [];
        if (messages.length > 0) {  // Only include sessions with messages
          console.log("Processing session:", session.id, "with messages:", messages);
          sessionsMap[session.id] = {
            ...session,
            messages: messages
          };
        }
      });

      console.log("Processed sessions map:", sessionsMap);
      return sessionsMap;
    },
    enabled: !!session?.user?.id,
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  useEffect(() => {
    if (!session?.user?.id) return;

    console.log("Setting up realtime subscriptions for user:", session.user.id);

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
      console.log("Cleaning up realtime subscriptions");
      sessionsChannel.unsubscribe();
      messagesChannel.unsubscribe();
    };
  }, [session?.user?.id]);

  const sessions = {
    ...(initialSessions || {}),
    ...realtimeSessions,
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <Alert variant="destructive">
          <AlertDescription>
            Error loading chat sessions: {error.message}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const sessionsList = Object.values(sessions).filter(session => 
    session.messages && session.messages.length > 0
  );
  
  if (sessionsList.length === 0) {
    return (
      <div className="p-6">
        <Alert>
          <AlertDescription>
            No active chat sessions found. Chat sessions will appear here once visitors start chatting with your chatbot.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Chat Sessions</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sessionsList
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