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
import { Loader2, AlertCircle } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

const CHAT_LIMIT = 10;

const ChatMonitoring = () => {
  const session = useSession();
  const { toast } = useToast();
  const [realtimeSessions, setRealtimeSessions] = useState<Record<string, ChatSession>>({});

  const { data: initialSessions, isLoading, error } = useQuery({
    queryKey: ["chat-sessions"],
    queryFn: async () => {
      if (!session?.user?.id) {
        throw new Error("No authenticated user");
      }

      console.log("Fetching chat sessions for user:", session.user.id);
      
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

      // Get only the 10 most recent chat sessions with messages
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
        .eq("profile_id", profile.id)
        .order('created_at', { ascending: false })
        .limit(CHAT_LIMIT);

      if (sessionsError) {
        console.error("Error fetching chat sessions:", sessionsError);
        throw sessionsError;
      }

      console.log("Raw sessions data:", sessions);

      // Group messages by session
      const sessionsMap: Record<string, ChatSession> = {};
      sessions?.forEach((session: any) => {
        const messages = session.chat_messages || [];
        if (messages.length > 0) {
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
            const currentSessionsCount = Object.keys(current).length;
            
            // If we already have 10 sessions and this is a new one, show toast and don't add it
            if (currentSessionsCount >= CHAT_LIMIT && payload.eventType === "INSERT") {
              toast({
                title: "Chat Limit Reached",
                description: `You can only monitor ${CHAT_LIMIT} most recent chats. Older chats will not be displayed.`,
                variant: "warning",
              });
              return current;
            }

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

            // If this session is already at the limit, don't add more messages
            if (Object.keys(current).length >= CHAT_LIMIT) {
              toast({
                title: "Chat Limit Reached",
                description: `You can only monitor ${CHAT_LIMIT} most recent chats. Older messages will not be displayed.`,
                variant: "warning",
              });
              return current;
            }

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
  }, [session?.user?.id, toast]);

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
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Chat Sessions</h1>
        <Alert variant="warning" className="w-auto">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="ml-2">
            Showing {sessionsList.length} of maximum {CHAT_LIMIT} recent chats
          </AlertDescription>
        </Alert>
      </div>
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
                              : message.role === "owner"
                              ? "bg-blue-500 text-white"
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