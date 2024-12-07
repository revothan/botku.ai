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
  training_data: string | null;
  created_at: string;
  updated_at: string;
  assistant_id: string | null;
  buttons: ButtonConfig[];
};

// Helper type for form data (subset of ChatbotSettings)
export type ChatbotFormData = Pick<ChatbotSettings, 'bot_name' | 'greeting_message' | 'training_data'>;