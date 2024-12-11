import { useEffect, useState } from "react";
import { useSession } from "@supabase/auth-helpers-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import type { ChatSession } from "@/types/chat";
import { ChatSessionCard } from "@/components/chat-monitoring/ChatSessionCard";
import { NoChatsAlert } from "@/components/chat-monitoring/NoChatsAlert";
import { ChatLimitAlert } from "@/components/chat-monitoring/ChatLimitAlert";

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
    refetchInterval: 30000,
  });

  useEffect(() => {
    if (!session?.user?.id) return;

    console.log("Setting up realtime subscriptions for user:", session.user.id);

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
            
            if (currentSessionsCount >= CHAT_LIMIT && payload.eventType === "INSERT") {
              toast({
                title: "Chat Limit Reached",
                description: `You can only monitor ${CHAT_LIMIT} most recent chats. Older chats will not be displayed.`,
                variant: "default",
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
          const message = payload.new;
          setRealtimeSessions((current) => {
            const session = current[message.session_id];
            if (!session) return current;

            if (Object.keys(current).length >= CHAT_LIMIT) {
              toast({
                title: "Chat Limit Reached",
                description: `You can only monitor ${CHAT_LIMIT} most recent chats. Older messages will not be displayed.`,
                variant: "default",
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
    return <NoChatsAlert />;
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Chat Sessions</h1>
        <ChatLimitAlert 
          currentCount={sessionsList.length} 
          maxCount={CHAT_LIMIT} 
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sessionsList
          .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
          .map((session) => (
            <ChatSessionCard key={session.id} session={session} />
          ))}
      </div>
    </div>
  );
};

export default ChatMonitoring;