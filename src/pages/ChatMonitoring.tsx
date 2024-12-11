import { useEffect, useState } from "react";
import { useSession } from "@supabase/auth-helpers-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2 } from "lucide-react";
import { ChatMonitoringCard } from "@/components/chatbot/ChatMonitoringCard";
import type { ChatSession } from "@/types/chat";

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
      
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("id")
        .eq("id", session.user.id)
        .single();

      if (profileError) {
        console.error("Error fetching profile:", profileError);
        throw profileError;
      }

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

      const sessionsMap: Record<string, ChatSession> = {};
      sessions?.forEach((session: any) => {
        const messages = session.chat_messages || [];
        if (messages.length > 0) {
          sessionsMap[session.id] = {
            ...session,
            messages: messages
          };
        }
      });

      return sessionsMap;
    },
    enabled: !!session?.user?.id,
  });

  useEffect(() => {
    if (!session?.user?.id) return;

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
          const message = payload.new;
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
            <ChatMonitoringCard key={session.id} session={session} />
          ))}
      </div>
    </div>
  );
};

export default ChatMonitoring;