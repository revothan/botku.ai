export type ButtonConfig = {
  id: string;
  label: string;
  url: string;
};

export type UserType = 'business' | 'creator' | 'other';

export type ChatbotSettings = {
  id: string;
  profile_id: string;
  bot_name: string;
  greeting_message: string;
  training_data: string | null;
  created_at: string;
  updated_at: string;
  assistant_id: string | null;
  buttons: ButtonConfig[];
  user_type?: UserType;
  answers?: {
    business: string[];
    creator: string[];
    other: string[];
  };
};

export type Message = {
  role: "user" | "assistant";
  content: string;
};

export type ChatbotFormData = {
  bot_name: string;
  greeting_message: string;
  training_data: string | null;
  user_type?: UserType;
  answers?: {
    business: string[];
    creator: string[];
    other: string[];
  };
};