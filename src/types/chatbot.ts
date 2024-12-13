export type Message = {
  id: string;
  content: string;
  sender: 'user' | 'assistant';
  timestamp: string;
  role?: 'user' | 'assistant';
};

export type ButtonConfig = {
  id: string;
  label: string;
  url: string;
};

export type ChatbotSettings = {
  id: string;
  profile_id: string;
  bot_name: string;
  greeting_message: string;
  training_data: string;
  created_at: string;
  updated_at: string;
  assistant_id: string;
  buttons: ButtonConfig[];
  avatar_url: string | null;
  user_type?: string;
  answers?: {
    business: string[];
    creator: string[];
    other: string[];
  };
};

export type AssistantResponse = {
  response: {
    type: string;
    text: {
      value: string;
      annotations: any[];
    };
  };
};

export type ChatbotFormData = {
  bot_name: string;
  greeting_message: string;
  training_data: string | null;
  user_type?: 'business' | 'creator' | 'other';
  answers?: {
    business: string[];
    creator: string[];
    other: string[];
  };
};