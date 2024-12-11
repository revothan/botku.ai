export type ChatMessage = {
  id: string;
  session_id: string;
  role: "user" | "assistant";
  content: string;
  created_at: string;
};

export type ChatSession = {
  id: string;
  profile_id: string;
  visitor_id: string;
  visitor_ip: string | null;
  user_agent: string | null;
  status: "active" | "ended";
  started_at: string;
  ended_at: string | null;
  created_at: string;
  updated_at: string;
  messages?: ChatMessage[];
};